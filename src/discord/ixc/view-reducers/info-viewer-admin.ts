import {AdminB, BackB, DeleteB, DeleteConfirmB, SingleS, SubmitB} from '#src/discord/ixc/components/global-components.ts';
import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {E} from '#src/internal/pure/effect.ts';
import {asEditor, unset} from '#src/discord/ixc/components/component-utils.ts';
import {InfoNavS, InfoViewerB, KindNavS} from '#src/discord/ixc/view-reducers/info-viewer.ts';
import {infoDelete} from '#src/dynamo/operations/info.ts';
import {dtNowIso} from '#src/discord/util/markdown.ts';
import {EmbedEditorB} from '#src/discord/ixc/view-reducers/editors/embed-editor.ts';
import {SELECT_INFO_KIND, SELECT_POSITIONS} from '#src/discord/ix-constants.ts';
import {decodePersist, encodePersist, extractPersist} from '#src/discord/ixc/components/persistor.ts';
import {DELIM} from '#src/discord/ixc/store/id-routes.ts';
import {discordEmbedDelete} from '#src/dynamo/operations/embed.ts';


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
    const persisted = decodePersist(s.description);

    const infoEmbedId = extractPersist(persisted, ax, InfoNavS.fromMap(s.cmap));
    const kind = extractPersist(persisted, ax, KindNavS.fromMap(s.cmap));
    const position = extractPersist(persisted, ax, PositionS);

    const Kind = KindS.fromMap(s.cmap).setDefaultValuesIf(KindS.id.predicate, kind);

    const Position = PositionS.fromMap(s.cmap).setDefaultValuesIf(PositionS.id.predicate, position);

    if (DeleteConfirm.clicked(ax)) {
        const [infoId, embedId] = infoEmbedId[0].split(DELIM.DATA);

        yield * infoDelete({pk: s.server_id, sk: infoId});
        yield * discordEmbedDelete(embedId);
    }

    return {
        ...s,
        title      : 'Edit Info Page',
        description: encodePersist(
            KindNavS.setDefaultValuesIf(KindNavS.id.predicate, kind),
            InfoNavS.render({
                options: infoEmbedId.map((i) => ({
                    label  : '',
                    value  : i,
                    default: true,
                })),
            }),
            Position,
        ),

        editor: asEditor({
            ...s.viewer,
            ...s.editor,
            timestamp: dtNowIso(),
        }),
        viewer: unset,
        status: unset,

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
            EmbedEditorB.fwd(InfoViewerAdminB.id),
        ],

        submit: Submit.render({
            disabled:
                Delete.clicked(ax)
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
