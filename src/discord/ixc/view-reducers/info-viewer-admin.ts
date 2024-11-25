import {AdminB, BackB, DeleteB, DeleteConfirmB, SingleS, SubmitB} from '#src/discord/ixc/components/global-components.ts';
import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {E} from '#src/internal/pure/effect.ts';
import {asConfirm, asEditor, asSuccess, unset} from '#src/discord/ixc/components/component-utils.ts';
import {InfoNavS, InfoViewerB, KindNavS} from '#src/discord/ixc/view-reducers/info-viewer.ts';
import {infoCreate, infoDelete, infoRead} from '#src/dynamo/operations/info.ts';
import {dtNow, dtNowIso} from '#src/discord/util/markdown.ts';
import {EmbedEditorB} from '#src/discord/ixc/view-reducers/editors/embed-editor.ts';
import {SELECT_INFO_KIND, SELECT_POSITIONS, UNAVAILABLE} from '#src/discord/ix-constants.ts';
import {DELIM} from '#src/discord/ixc/store/id-routes.ts';
import {discordEmbedCreate, discordEmbedDelete, discordEmbedRead} from '#src/dynamo/operations/embed.ts';
import {fromReferenceFields, toReferenceFields} from '#src/discord/ixc/views/util.ts';
import type {DInfo} from '#src/dynamo/schema/discord-info.ts';
import {MenuCache} from '#src/dynamo/cache/menu-cache.ts';


export const InfoViewerAdminB = AdminB.as(makeId(RDXK.OPEN, 'IVA'));
const Submit = SubmitB.as(makeId(RDXK.SUBMIT, 'IVA'));
const Delete = DeleteB.as(makeId(RDXK.DELETE, 'IVA'));
const DeleteConfirm = DeleteConfirmB.as(makeId(RDXK.DELETE_CONFIRM, 'IVA'));
const KindS = SingleS.as(makeId(RDXK.UPDATE, 'IVAK'), {
    placeholder: 'Select Info Kind',
    options    : SELECT_INFO_KIND,
});
const PositionS = SingleS.as(makeId(RDXK.UPDATE, 'IVAP'), {
    placeholder: 'Select Position',
    options    : SELECT_POSITIONS,
});


const view = typeRx((s, ax) => E.gen(function * () {
    const fields = fromReferenceFields(s.system);

    fields.InfoKind ??= {
        name : 'InfoKind',
        value: KindNavS.fromMap(s.cmap).values[0],
    };

    fields.InfoId ??= {
        name : 'InfoId',
        value: InfoNavS.fromMap(s.cmap).values[0].split(DELIM.DATA)[0],
    };

    fields.EmbedId ??= {
        name : 'EmbedId',
        value: InfoNavS.fromMap(s.cmap).values[0].split(DELIM.DATA)[1],
    };

    let Position = PositionS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, ax.selected.map((s) => s.value));
    let Kind = KindS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, ax.selected.map((s) => s.value));


    if (ax.id.predicate === InfoViewerAdminB.id.predicate || ax.id.nextPredicate === InfoViewerAdminB.id.predicate) {
        const info = yield * infoRead({pk: s.server_id, sk: fields.InfoId.value});

        fields.Position ??= {
            name : 'Position',
            value: `${info.selector_order ?? UNAVAILABLE}`,
        };

        Position = Position.setDefaultValuesIf(Position.id.predicate, [`${info.selector_order ?? '25'}`]);
        Kind = Kind.setDefaultValuesIf(Kind.id.predicate, [fields.InfoKind.value]);
    }

    if (ax.id.predicate === Position.id.predicate) {
        fields.Position = {
            name : 'Position',
            value: Position.values[0],
        };
    }

    if (ax.id.predicate === Kind.id.predicate) {
        fields.InfoKind = {
            name : 'InfoKind',
            value: Kind.values[0],
        };
    }

    if (DeleteConfirm.clicked(ax)) {
        yield * infoDelete({pk: s.server_id, sk: fields.InfoId.value});
        yield * discordEmbedDelete(fields.EmbedId.value);
        yield * MenuCache.embedInvalidate(fields.EmbedId.value);
    }


    if (Submit.clicked(ax)) {
        const info = yield * infoRead({pk: s.server_id, sk: fields.InfoId.value});
        const embed = yield * discordEmbedRead(fields.EmbedId.value);

        yield * infoCreate({
            ...info,
            updated       : dtNow(),
            kind          : fields.InfoKind.value as DInfo['kind'],
            selector_order: parseInt(fields.Position!.value),
            selector_label: embed.embed.title,
        });
        yield * discordEmbedCreate({
            ...embed,
            updated: dtNow(),
            embed  : s.editor!,
        });
    }


    return {
        ...s,
        title      : 'Edit Info Page',
        description: unset,
        system     : toReferenceFields(fields),

        editor: asEditor({
            ...s.viewer,
            ...s.editor,
            timestamp: dtNowIso(),
        }),
        viewer: unset,
        status:
            Submit.clicked(ax) ? asSuccess({description: 'Info Embed Edited'})
            : Delete.clicked(ax) ? asConfirm({description: 'Are you sure you want to delete this embed?'})
            : DeleteConfirm.clicked(ax) ? asSuccess({description: 'Info Embed Deleted'})
            : unset,

        sel1: Kind.render({
            disabled:
                Delete.clicked(ax)
                || DeleteConfirm.clicked(ax)
                || Submit.clicked(ax),
        }),
        sel2: Position.render({
            disabled:
                Delete.clicked(ax)
                || DeleteConfirm.clicked(ax)
                || Submit.clicked(ax),
        }),

        row3: [
            EmbedEditorB.fwd(InfoViewerAdminB.id).render({
                disabled:
                    Delete.clicked(ax)
                    || DeleteConfirm.clicked(ax)
                    || Submit.clicked(ax),
            }),
        ],

        submit: Submit.render({
            disabled:
                Submit.clicked(ax)
                || Delete.clicked(ax)
                || DeleteConfirm.clicked(ax)
                || !Kind.values.length
                || !Position.values.length,
        }),
        delete:
            (
                Delete.clicked(ax) ? DeleteConfirm
                : Delete
            ).render({
                disabled:
                    Submit.clicked(ax)
                    || DeleteConfirm.clicked(ax),
            }),
        back: BackB.as(InfoViewerB.id),
    };
}));


export const infoViewerAdminReducer = {
    [InfoViewerAdminB.id.predicate]: view,
    [Submit.id.predicate]          : view,
    [Delete.id.predicate]          : view,
    [DeleteConfirm.id.predicate]   : view,
    [KindS.id.predicate]           : view,
    [PositionS.id.predicate]       : view,
};
