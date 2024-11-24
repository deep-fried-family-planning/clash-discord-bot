import {PrimaryB} from '#src/discord/ixc/components/global-components.ts';
import {makeId} from '#src/discord/ixc/store/type-rx.ts';
import {RDXK} from '#src/discord/ixc/store/types.ts';
import type {IxState} from '#src/discord/ixc/store/derive-state.ts';
import type {IxAction} from '#src/discord/ixc/store/derive-action.ts';
import {E} from '#src/internal/pure/effect.ts';


export const RosterOverviewB = PrimaryB.as(makeId(RDXK.OPEN, 'RO'), {
    label: 'Overview',
});


const view = (s: IxState, ax: IxAction) => E.gen(function * () {
    return {
        ...s,
        title: 'Roster Overview',
    };
});


export const rosterOverviewReducer = {
    [RosterOverviewB.id.predicate]: view,
};
