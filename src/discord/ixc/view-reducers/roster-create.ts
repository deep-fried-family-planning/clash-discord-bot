import {typeRx, makeId} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import {BackB, ForwardB, SuccessB} from '#src/discord/ixc/components/global-components.ts';
import {E} from '#src/internal/pure/effect.ts';
import {RosterViewerB} from '#src/discord/ixc/view-reducers/roster-viewer.ts';


export const RosterCreateB = SuccessB.as(makeId(RDXK.OPEN, 'RC'), {
    label: 'Create',
});
const Submit = SuccessB.as(makeId(RDXK.SUBMIT, 'RC'), {});


const view = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        title      : 'Create Roster',
        description: undefined,


        back   : BackB.as(RosterViewerB.id),
        forward: ForwardB.forward(RosterViewerB.id),
    };
}));


export const rosterCreateReducer = {
    [RosterCreateB.id.predicate]: view,
};

