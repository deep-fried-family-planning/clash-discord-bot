import {makeId, typeRx} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {BackB, DangerB} from '#src/discord/ixc/components/global-components.ts';
import {E} from '#src/internal/pure/effect.ts';
import {RosterCreateB} from '#src/discord/ixc/view-reducers/rosters/roster-create.ts';
import {IXCBS} from '#src/discord/util/discord.ts';
import {RosterEditB} from '#src/discord/ixc/view-reducers/rosters/roster-edit.ts';
import {SelectRosterB} from '#src/discord/ixc/view-reducers/rosters/roster-select.ts';
import {RosterDeleteB} from '#src/discord/ixc/view-reducers/rosters/roster-delete.ts';
import {RostersB} from '#src/discord/ixc/view-reducers/board-info.ts';


const axn = {
    ROSTER_MANAGE_OPEN: makeId(RDXK.OPEN, 'RMNG'),
};


export const RosterManageB = DangerB.as(axn.ROSTER_MANAGE_OPEN, {
    label: 'Manage',
});


const open = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        title : 'Manage Rosters',
        info  : undefined,
        editor: undefined,
        row1  : [
            RosterCreateB,
            SelectRosterB.fwd(RosterEditB.id).render({
                label: 'Edit',
            }),
            SelectRosterB.fwd(RosterDeleteB.id).render({
                label: 'Delete',
                style: IXCBS.DANGER,
            }),
        ],
        back: BackB.as(RostersB.id),
    };
}));


export const rosterManageReducer = {
    [axn.ROSTER_MANAGE_OPEN.predicate]: open,
};
