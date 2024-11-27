import {AdminB, BackB, DeleteB, DeleteConfirmB, SingleS, SubmitB} from '#src/discord/components/global-components.ts';
import {makeId} from '#src/discord/store/type-rx.ts';
import {E} from '#src/internal/pure/effect.ts';
import {RosterS, RosterViewerB} from '#src/discord/view-reducers/roster-viewer.ts';
import {EmbedEditorB} from '#src/discord/view-reducers/editors/embed-editor.ts';
import {asConfirm, asEditor, asSuccess, unset} from '#src/discord/components/component-utils.ts';
import {DateTimeEditorB} from '#src/discord/view-reducers/editors/embed-date-time-editor.ts';
import {ClanSelectB} from '#src/discord/view-reducers/old/clan-select.ts';
import {SELECT_ROSTER_TYPE} from '#src/constants/ix-constants.ts';
import {rosterDelete} from '#src/dynamo/operations/roster.ts';
import {RK_DELETE, RK_DELETE_CONFIRM, RK_OPEN, RK_SUBMIT, RK_UPDATE} from '#src/constants/route-kind.ts';
import type {St} from '#src/discord/store/derive-state.ts';
import type {Ax} from '#src/discord/store/derive-action.ts';
import {PLACEHOLDER_ROSTER_TYPE} from '#src/constants/placeholder.ts';
import {LABEL_TITLE_ROSTER_ADMIN} from '#src/constants/label.ts';


export const RosterViewerAdminB = AdminB.as(makeId(RK_OPEN, 'RVA'));
const Submit = SubmitB.as(makeId(RK_SUBMIT, 'RVA'));
const Delete = DeleteB.as(makeId(RK_DELETE, 'RVA'));
const ConfirmDelete = DeleteConfirmB.as(makeId(RK_DELETE_CONFIRM, 'RVA'));
const TypeS = SingleS.as(makeId(RK_UPDATE, 'RCT'), {
    placeholder: PLACEHOLDER_ROSTER_TYPE,
    options    : SELECT_ROSTER_TYPE,
});


const view = (s: St, ax: Ax) => E.gen(function * () {
    const selected = ax.selected.map((s) => s.value);

    const Roster = RosterS.fromMap(s.cmap);
    const Type = TypeS.fromMap(s.cmap).setDefaultValuesIf(ax.id.predicate, selected);

    const isEditDisabled
        = (Submit.clicked(ax)
            || Delete.clicked(ax)
            || ConfirmDelete.clicked(ax))
            ? {disabled: true}
            : {};

    if (ConfirmDelete.clicked(ax)) {
        yield * rosterDelete({pk: s.server_id, sk: Roster.values[0]});
    }

    return {
        ...s,

        title      : LABEL_TITLE_ROSTER_ADMIN,
        description: unset,

        viewer: unset,
        editor: asEditor(s.editor ?? s.viewer),
        status:
            Submit.clicked(ax) ? asSuccess({description: 'Roster Edited'})
            : Delete.clicked(ax) ? asConfirm({description: 'Are you sure?'})
            : ConfirmDelete.clicked(ax) ? asSuccess({description: 'Roster Deleted'})
            : unset,

        navigate: Roster.render({disabled: true}),
        sel2    : Type.render(isEditDisabled),
        row3    : [
            EmbedEditorB.fwd(RosterViewerAdminB.id).render(isEditDisabled),
            DateTimeEditorB.fwd(RosterViewerAdminB.id).render({
                ...isEditDisabled,
                label: 'Search Date/Time',
            }),
            ClanSelectB.fwd(RosterViewerAdminB.id).render(isEditDisabled),
        ],

        back  : BackB.as(RosterViewerB.id),
        submit: Submit.render({
            disabled:
                Submit.clicked(ax)
                || Delete.clicked(ax)
                || ConfirmDelete.clicked(ax)
                || Type.values.length === 0,
        }),
        delete:
            (
                Delete.clicked(ax)
                    ? ConfirmDelete
                    : Delete
            ).render({
                disabled: ConfirmDelete.clicked(ax),
            }),
    } satisfies St;
});


export const rosterViewerAdminReducer = {
    [RosterViewerAdminB.id.predicate]: view,
    [Submit.id.predicate]            : view,
    [Delete.id.predicate]            : view,
    [ConfirmDelete.id.predicate]     : view,
    [TypeS.id.predicate]             : view,
};
