import {AdminB, BackB, DeleteB, DeleteConfirmB, SingleS, SubmitB} from '#src/discord/ixc/components/global-components.ts';
import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {CSL, E, pipe} from '#src/internal/pure/effect.ts';
import {asEditor, unset} from '#src/discord/ixc/components/component-utils.ts';
import {InfoNavS, InfoViewerB, KindNavS} from '#src/discord/ixc/view-reducers/info-viewer.ts';
import {infoDelete, infoQueryByServer} from '#src/dynamo/operations/info.ts';
import {filterL, mapL} from '#src/internal/pure/pure-list.ts';
import {dtNowIso} from '#src/discord/util/markdown.ts';
import {EmbedEditorB} from '#src/discord/ixc/view-reducers/editors/embed-editor.ts';
import {SELECT_INFO_KIND} from '#src/discord/ix-constants.ts';
import type {SelectOption} from 'dfx/types';


export const InfoViewerAdminB = AdminB.as(makeId(RDXK.OPEN, 'IVA'));
const Submit = SubmitB.as(makeId(RDXK.SUBMIT, 'IVA'));
const Delete = DeleteB.as(makeId(RDXK.DELETE, 'IVA'));
const DeleteConfirm = DeleteConfirmB.as(makeId(RDXK.DELETE_CONFIRM, 'IVA'));
const KindS = SingleS.as(makeId(RDXK.UPDATE, 'IVAK'), {
    placeholder: 'Select Kind',
    options    : SELECT_INFO_KIND,
});
const AfterS = SingleS.as(makeId(RDXK.UPDATE, 'IVAPA'), {
    placeholder: 'Select Order After',
    options    : [
        {
            label      : 'First',
            value      : 'first',
            description: 'Override: Make this the 1st embed of the kind',
        },
        {
            label      : 'Last',
            value      : 'last',
            description: 'Override: Make this the last embed of the kind',
        },
    ],
});


type Recaptured = {
    infoId? : string;
    kind?   : string;
    afterId?: string;
};


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);
    const recaptured = JSON.parse(s.editor?.footer?.text ?? '{}') as Recaptured;

    let Kind = KindNavS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    let After = AfterS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    let Info = InfoNavS.fromMap(s.cmap);

    const current = {
        infoId : recaptured.infoId ?? Info.values[0],
        kind   : recaptured.kind ?? Kind.values[0],
        afterId: recaptured.afterId ?? After.values[0],
    };

    yield * CSL.debug('current', current);

    Kind = Kind.as(KindS.id).setDefaultValuesIf(ax.id.predicate,
        selected.length
            ? selected
            : [current.kind],
    );
    After = After.setDefaultValuesIf(ax.id.predicate,
        selected.length
            ? selected
            : [current.afterId],
    );

    if (Info.values.length === 0) {
        Info = Info.render({
            options: [{
                label  : current.infoId,
                value  : current.infoId,
                default: true,
            }],
        });
    }

    if (InfoViewerAdminB.clicked(ax)) {
        const infos = yield * infoQueryByServer({pk: s.server_id});

        After = After.render({
            options: pipe(
                infos,
                filterL((i) => i.kind === Kind.values[0]),
                mapL((i) => ({
                    label: i.name,
                    value: i.sk,
                })),
            ),
        });
    }


    if (DeleteConfirm.clicked(ax)) {
        yield * infoDelete({pk: s.server_id, sk: current.infoId});
    }

    return {
        ...s,
        title      : 'Edit Info Page',
        description: unset,

        editor: asEditor({
            ...s.viewer,
            ...s.editor,
            footer: {
                text: JSON.stringify(current),
            },
            timestamp: dtNowIso(),
        }),
        viewer: unset,
        status: unset,

        navigate: Info.render({disabled: true}),
        sel1    : Kind.render({
            disabled:
                Delete.clicked(ax)
                || DeleteConfirm.clicked(ax)
                || Submit.clicked(ax),
        }),
        sel2: After.render({
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
                || !After.values.length,
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
    [AfterS.id.predicate]          : view,
};
