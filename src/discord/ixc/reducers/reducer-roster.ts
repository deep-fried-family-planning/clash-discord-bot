import {buildReducer} from '#src/discord/ixc/reducers/build-reducer.ts';
import {E} from '#src/internal/pure/effect.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {RosterS, RosterSF} from '#src/discord/ixc/components/components.ts';
import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {BackB, CloseB, NextB} from '#src/discord/ixc/components/global-components.ts';


const joinRoster = buildReducer((s, ax) => E.gen(function * () {
    return {
        ...s,
        info: jsonEmbed({
            type: 'joinRoster',
        }),
        row1 : [RosterSF.as(AXN.ROSTER_SELECT_FILTER)],
        row2 : [RosterS.as(AXN.ROSTER_SELECT_UPDATE)],
        close: CloseB,
        back : BackB.as(AXN.ROSTER_OPEN),
        next : NextB.as(AXN.NOOP, {disabled: true}),
    };
}));


const openSelectRoster = buildReducer((s, ax) => E.gen(function * () {
    return {
        ...s,
        info: jsonEmbed({
            type: 'openSelectRoster',
        }),
        row1 : [RosterSF.as(AXN.ROSTER_SELECT_FILTER)],
        row2 : [RosterS.as(AXN.ROSTER_SELECT_UPDATE)],
        close: CloseB,
        back : BackB.as(AXN.ROSTER_OPEN),
        next : s.next?.withFwd(ax.id, '', {disabled: true}),
    };
}));


const updateSelectRoster = buildReducer((s, ax) => E.gen(function * () {
    return {
        ...s,
        info: jsonEmbed({
            type: 'selectRoster',
        }),
        row1 : [RosterSF.as(AXN.ROSTER_SELECT_FILTER)],
        row2 : [RosterS.as(AXN.ROSTER_SELECT_UPDATE)],
        close: s.close,
        back : s.back,
        next : s.next?.withFwd(ax.id, '', {disabled: false}),
    };
}));


export const reducerRoster = {
    [AXN.ROSTER_JOIN_OPEN.predicate]    : joinRoster,
    [AXN.ROSTER_SELECT_OPEN.predicate]  : openSelectRoster,
    [AXN.ROSTER_SELECT_UPDATE.predicate]: updateSelectRoster,
    [AXN.ROSTER_SELECT_FILTER.predicate]: updateSelectRoster,
};
