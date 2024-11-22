import {makeId, typeRx} from '#src/discord/ixc/reducers/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {DangerB} from '#src/discord/ixc/components/global-components.ts';
import {E} from '#src/internal/pure/effect.ts';
import {RosterCreateB} from '#src/discord/ixc/view-reducers/roster-create.ts';
import {EditEmbedB, EmbedEditorB} from '#src/discord/ixc/view-reducers/embed-editor.ts';
import {IXCBS} from '#src/discord/util/discord.ts';


const axn = {
    ROSTER_MANAGE_OPEN: makeId(RDXK.OPEN, 'RMNG'),
};


export const RosterManageB = DangerB.as(axn.ROSTER_MANAGE_OPEN, {
    label: 'Manage',
});


const open = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        title: 'Manage Rosters',
        row1 : [
            RosterCreateB,
            // SelectRosterB
            //     .render({
            //         label: 'Edit',
            //     }),
            // SelectRosterB
            //     .render({
            //         label: 'Delete',
            //         style: IXCBS.DANGER,
            //     }),
        ],
    };
}));


export const rosterManageReducer = {
    [axn.ROSTER_MANAGE_OPEN.predicate]: open,
};
