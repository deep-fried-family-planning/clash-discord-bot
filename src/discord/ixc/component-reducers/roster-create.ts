import {makeId, typeRx} from '#src/discord/ixc/reducers/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {SuccessB} from '#src/discord/ixc/components/global-components.ts';
import {E} from '#src/internal/pure/effect.ts';


const axn = {
    ROSTER_CREATE_OPEN: makeId(RDXK.OPEN, 'RCREATE'),
};


export const RosterCreateB = SuccessB.as(axn.ROSTER_CREATE_OPEN, {
    label: 'Create',
});


const view = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        row1: [
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


export const rosterCreateReducer = {
    [axn.ROSTER_CREATE_OPEN.predicate]: view,
};
