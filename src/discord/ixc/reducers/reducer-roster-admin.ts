import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {typeRx} from '#src/discord/ixc/reducers/type-rx.ts';
import {E} from '#src/internal/pure/effect.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {RosterCreateB, RosterDeleteB, RosterEditB} from '#src/discord/ixc/components/components.ts';
import {BackB, CloseB} from '#src/discord/ixc/components/global-components.ts';


const RosterOpen = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        info: jsonEmbed({
            type: 'rosterAdmin',
        }),
        row1: [
            RosterCreateB.as(AXN.ROSTER_CREATE),
            RosterEditB.as(AXN.ROSTER_SELECT_OPEN).fwd(AXN.ROSTER_EDIT),
            RosterDeleteB.as(AXN.ROSTER_SELECT_OPEN).fwd(AXN.ROSTER_DELETE),
        ],
        close: CloseB,
        back : BackB.as(AXN.ROSTER_OPEN),
    };
}));


const rosterAdmin = typeRx((s, ax) => E.gen(function * () {
    return yield * RosterOpen(s, ax);
}));


const createRoster = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
    };
}));


const submitCreateRoster = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
    };
}));


const editRoster = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
    };
}));


const deleteRoster = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
    };
}));


export const reducerRosterAdmin = {
    [AXN.ROSTER_ADMIN_OPEN.predicate]: rosterAdmin,
    // [AXN.ROSTER_CREATE.predicate]       : createRoster,
    // [AXN.ROSTER_CREATE_SUBMIT.predicate]: submitCreateRoster,
    // [AXN.ROSTER_EDIT.predicate]         : editRoster,
    // [AXN.ROSTER_DELETE.predicate]       : deleteRoster,
};
