import {makeId, typeRx, typeRxHelper} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {BackB, DangerB} from '#src/discord/ixc/components/global-components.ts';
import {E} from '#src/internal/pure/effect.ts';
import {RosterManageB} from '#src/discord/ixc/view-reducers/rosters/roster-manage.ts';


const axn = {
    ROSTER_CREATE_OPEN  : makeId(RDXK.OPEN, 'RDELETE'),
    ROSTER_CREATE_SUBMIT: makeId(RDXK.SUBMIT, 'RDELETE'),
};


export const RosterDeleteB = DangerB.as(axn.ROSTER_CREATE_OPEN, {
    label: 'Delete',
});
const Submit = DangerB.as(axn.ROSTER_CREATE_OPEN, {
    label: 'Delete',
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
        back  : BackB.as(RosterManageB.id),
        submit: Submit.render({
            disabled: isSubmitted,
        }),
    };
}));


export const rosterDeleteReducer = {
    [axn.ROSTER_CREATE_OPEN.predicate]  : view,
    [axn.ROSTER_CREATE_SUBMIT.predicate]: view,
};
