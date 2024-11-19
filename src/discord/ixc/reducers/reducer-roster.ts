import {buildReducer} from '#src/discord/ixc/reducers/build-reducer.ts';
import {E} from '#src/internal/pure/effect.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {RosterS, RosterSF} from '#src/discord/ixc/components/components.ts';
import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {BackB, CloseB, NextB} from '#src/discord/ixc/components/global-components.ts';


const joinRoster = buildReducer((s, ax) => E.gen(function * () {
    return {
        ...s,
        view: {
            info: jsonEmbed({
                type: 'joinRoster',
            }),
            rows: [
                [RosterSF.as(AXN.ROSTER_SELECT_FILTER, {disabled: true})],
                [RosterS.as(AXN.ROSTER_SELECT_UPDATE, {disabled: true})],
            ],
            close: CloseB,
            back : BackB.as(AXN.ROSTER_OPEN),
            next : NextB.as(AXN.NOOP, {disabled: true}),
        },
    };
}));


const openSelectRoster = buildReducer((s, ax) => E.gen(function * () {
    return {
        ...s,
        view: {
            info: jsonEmbed({
                type: 'openSelectRoster',
            }),
            rows: [
                [RosterSF.as(AXN.ROSTER_SELECT_FILTER)],
                [RosterS.as(AXN.ROSTER_SELECT_UPDATE)],
            ],
            close: CloseB,
            back : BackB.as(AXN.ROSTER_OPEN),
            next : s.view?.next?.withFwd(ax.id, '', {disabled: true}),
        },
    };
}));


const updateSelectRoster = buildReducer((s, ax) => E.gen(function * () {
    return {
        ...s,
        view: {
            info: jsonEmbed({
                type: 'selectRoster',
            }),
            rows: [
                [RosterSF.as(AXN.ROSTER_SELECT_FILTER, {disabled: true})],
                [RosterS.as(AXN.ROSTER_SELECT_UPDATE, {disabled: true})],
            ],
            close: s.view?.close,
            back : s.view?.back,
            next : s.view?.next?.withFwd(ax.id, '', {disabled: false}),
        },
    };
}));


export const reducerRoster = {
    [AXN.ROSTER_JOIN_OPEN.predicate]    : joinRoster,
    [AXN.ROSTER_SELECT_OPEN.predicate]  : openSelectRoster,
    [AXN.ROSTER_SELECT_UPDATE.predicate]: updateSelectRoster,
    [AXN.ROSTER_SELECT_FILTER.predicate]: updateSelectRoster,
};
