import {
    AdminB,
    BackB,
    DangerB, DeleteB, DeleteConfirmB,
    SingleS,
    SubmitB,
    SuccessB,
} from '#src/discord/ixc/components/global-components.ts';
import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {E} from '#src/internal/pure/effect';
import {RosterS, RosterViewerB} from '#src/discord/ixc/view-reducers/roster-viewer.ts';
import {EmbedEditorB} from '#src/discord/ixc/view-reducers/editors/embed-editor.ts';
import {asConfirm, asEditor, asSuccess, unset} from '#src/discord/ixc/components/component-utils.ts';
import {DateTimeEditorB} from '#src/discord/ixc/view-reducers/editors/date-time-editor.ts';
import {ClanSelectB} from '#src/discord/ixc/view-reducers/old/clan-select.ts';
import {SELECT_ROSTER_TYPE} from '#src/discord/ix-constants.ts';


export const RosterViewerAdminB = AdminB.as(makeId(RDXK.OPEN, 'RVA'), {
});
const Submit = SubmitB.as(makeId(RDXK.SUBMIT, 'RVA'));
const Delete = DeleteB.as(makeId(RDXK.DELETE, 'RVA'));
const ConfirmDelete = DeleteConfirmB.as(makeId(RDXK.DELETE_CONFIRM, 'RVA'));
const TypeS = SingleS.as(makeId(RDXK.UPDATE, 'RCT'), {
    placeholder: 'Select Roster Type',
    options    : SELECT_ROSTER_TYPE,
});


const view = typeRx((s, ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    const Roster = RosterS.fromMap(s.cmap);
    const Type = TypeS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    const isEditDisabled
        = (Submit.clicked(ax)
            || Delete.clicked(ax)
            || ConfirmDelete.clicked(ax))
            ? {disabled: true}
            : {};

    if (Delete.clicked(ax)) {

    }

    return {
        ...s,

        title      : 'Roster Admin',
        description: unset,

        viewer: unset,
        editor: asEditor(s.editor ?? s.viewer),
        status:
            Submit.clicked(ax) ? asSuccess({description: 'Roster Edited'})
            : Delete.clicked(ax) ? asConfirm({description: 'Are you sure?'})
            : ConfirmDelete.clicked(ax) ? asSuccess({description: 'Not implemented yet...'})
            : unset,

        sel1: Roster.render({disabled: true}),
        sel2: Type.render(isEditDisabled),
        row3: [
            EmbedEditorB.fwd(RosterViewerAdminB.id).render(isEditDisabled),
            DateTimeEditorB.fwd(RosterViewerAdminB.id).render(isEditDisabled),
            ClanSelectB.fwd(RosterViewerAdminB.id).render(isEditDisabled),
        ],
        back  : BackB.backward(RosterViewerB.id),
        submit: Submit.render({
            disabled:
                Submit.clicked(ax)
                || Delete.clicked(ax)
                || ConfirmDelete.clicked(ax)
                || Type.values.length === 0,
        }),
        delete: Delete.clicked(ax)
            ? ConfirmDelete
            : Delete,
    };
}));


export const rosterViewerAdminReducer = {
    [RosterViewerAdminB.id.predicate]: view,
    [Submit.id.predicate]            : view,
    [Delete.id.predicate]            : view,
    [ConfirmDelete.id.predicate]     : view,
};
