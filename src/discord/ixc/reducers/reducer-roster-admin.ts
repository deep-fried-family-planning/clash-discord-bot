import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {buildReducer} from '#src/discord/ixc/reducers/build-reducer.ts';
import {E} from '#src/internal/pure/effect.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {RosterCreateB, RosterDeleteB, RosterEditB} from '#src/discord/ixc/components/components.ts';
import {BackB, CloseB} from '#src/discord/ixc/components/global-components.ts';


const RosterOpen = buildReducer((s, ax) => E.gen(function * () {
    return {
        ...s,
        view: {
            info: jsonEmbed({
                type: 'rosterAdmin',
            }),
            rows: [
                [
                    RosterCreateB.as(AXN.ROSTER_CREATE),
                    RosterEditB.as(AXN.ROSTER_SELECT_OPEN).fwd(AXN.ROSTER_EDIT),
                    RosterDeleteB.as(AXN.ROSTER_SELECT_OPEN).fwd(AXN.ROSTER_DELETE),
                ],
            ],
            close: CloseB,
            back : BackB.as(AXN.ROSTER_OPEN),
        },
    };
}));


const rosterAdmin = buildReducer((s, ax) => E.gen(function * () {
    return yield * RosterOpen(s, ax);
}));


const createRoster = buildReducer((s, ax) => E.gen(function * () {
    return {
        ...s,
    };
}));


const submitCreateRoster = buildReducer((s, ax) => E.gen(function * () {
    return {
        ...s,
    };
}));


const editRoster = buildReducer((s, ax) => E.gen(function * () {
    return {
        ...s,
    };
}));


const deleteRoster = buildReducer((s, ax) => E.gen(function * () {
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
