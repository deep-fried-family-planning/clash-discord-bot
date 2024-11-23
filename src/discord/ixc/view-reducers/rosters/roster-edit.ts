import {makeId, typeRx, typeRxHelper} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {BackB, PrimaryB, SuccessB} from '#src/discord/ixc/components/global-components.ts';
import {E} from '#src/internal/pure/effect.ts';
import {EmbedEditorB} from '#src/discord/ixc/view-reducers/editors/embed-editor.ts';
import {RosterManageB} from '#src/discord/ixc/view-reducers/rosters/roster-manage.ts';
import {DateTimeEditorB} from '#src/discord/ixc/view-reducers/editors/date-time-editor.ts';


const axn = {
    ROSTER_CREATE_OPEN  : makeId(RDXK.OPEN, 'REDIT'),
    ROSTER_CREATE_SUBMIT: makeId(RDXK.SUBMIT, 'REDIT'),
};


export const RosterEditB = PrimaryB.as(axn.ROSTER_CREATE_OPEN, {
    label: 'Create',
});
const Submit = SuccessB.as(axn.ROSTER_CREATE_OPEN, {
    label: 'Submit Edit',
});


const editRoster = typeRxHelper((s, ax) => E.gen(function * () {
    if (ax.id.predicate === axn.ROSTER_CREATE_SUBMIT.predicate) {
        return true;
    }

    return false;
}));


const view = typeRx((s, ax) => E.gen(function * () {
    const isSubmitted = yield * editRoster(s, ax);

    return {
        ...s,
        title: 'Edit Roster',
        info : {
            title: `${ax.id.params.forward}`,
        },
        editor: s.editor,
        row1  : [
            EmbedEditorB.fwd(RosterEditB.id).render({
                disabled: isSubmitted,
            }),
            DateTimeEditorB.fwd(RosterEditB.id).render({
                disabled: isSubmitted,
            }),
        ],
        back  : BackB.as(RosterManageB.id),
        submit: Submit.render({
            disabled: isSubmitted,
        }),
    };
}));


export const rosterEditReducer = {
    [axn.ROSTER_CREATE_OPEN.predicate]  : view,
    [axn.ROSTER_CREATE_SUBMIT.predicate]: view,
};
