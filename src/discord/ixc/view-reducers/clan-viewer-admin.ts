import {
    BackB,
    DangerB,
    ForwardB,
    SingleChannelS,
    SingleS,
    SuccessB,
} from '#src/discord/ixc/components/global-components.ts';
import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {E} from '#src/internal/pure/effect.ts';
import {ClanViewerB, ClanViewerSelector} from '#src/discord/ixc/view-reducers/clan-viewer.ts';
import {EmbedEditorB} from '#src/discord/ixc/view-reducers/editors/embed-editor.ts';
import {asConfirm, asEditor, asSuccess, unset} from '#src/discord/ixc/components/component-utils.ts';


export const ClanViewerAdminB = DangerB.as(makeId(RDXK.OPEN, 'CVA'), {
    label: 'Admin',
});
const Submit = SuccessB.as(makeId(RDXK.SUBMIT, 'CVA'), {
    label: 'Submit',
});
const Delete = DangerB.as(makeId(RDXK.DELETE, 'CVA'), {
    label: 'Delete',
});
const DeleteConfirm = DangerB.as(makeId(RDXK.DELETE_CONFIRM, 'CVA'), {
    label: 'Delete',
});
const ClanTypeS = SingleS.as(makeId(RDXK.UPDATE, 'CVAT'), {
    placeholder: 'Select Clan Type',
});
const CountdownS = SingleChannelS.as(makeId(RDXK.UPDATE, 'CVAC'), {
    placeholder: 'War Countdown Channel',
});


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    const ClanType = ClanTypeS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    const Countdown = CountdownS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);
    const Clan = ClanViewerSelector.fromMap(s.cmap);

    return {
        ...s,
        title      : 'Admin Clan',
        description: unset,

        viewer: unset,
        editor: asEditor(
            s.viewer
            ?? s.editor,
        ),
        status:
            Submit.clicked(ax) ? asSuccess({description: 'Clan Edited'})
            : Delete.clicked(ax) ? asConfirm({description: 'Are you sure?'})
            : DeleteConfirm.clicked(ax) ? asSuccess({description: 'Not implemented yet...'})
            : undefined,

        navigate: Clan.render({disabled: true}),
        sel1    : ClanType,
        sel2    : Countdown,
        row3    : [
            EmbedEditorB.fwd(ClanViewerAdminB.id),
        ],

        back  : BackB.as(ClanViewerB.id),
        submit: Submit.render({
            disabled:
                !Submit.clicked(ax)
                || !DeleteConfirm.clicked(ax)
                || ClanType.values.length === 0
                || Countdown.values.length === 0,
        }),
        delete: (
            Delete.clicked(ax)
                ? DeleteConfirm
                : Delete
        ).render({
            disabled:
                !Submit.clicked(ax)
                || DeleteConfirm.clicked(ax)
                || ClanType.values.length === 0
                || Countdown.values.length === 0,
        }),
        forward: ForwardB.fwd(ClanViewerB.id),
    };
}));


export const clanViewerAdminReducer = {
    [ClanViewerAdminB.id.predicate]: view,
    [Submit.id.predicate]          : view,
    [ClanTypeS.id.predicate]       : view,
    [Delete.id.predicate]          : view,
    [DeleteConfirm.id.predicate]   : view,
};
