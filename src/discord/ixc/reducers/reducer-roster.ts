import {typeRx} from '#src/discord/ixc/reducers/type-rx.ts';
import {E} from '#src/internal/pure/effect.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {RosterS, RosterSF} from '#src/discord/ixc/components/components.ts';
import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {BackB, NextB} from '#src/discord/ixc/components/global-components.ts';


const joinRoster = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        time: 'Join Roster',
        sel1: RosterSF.as(AXN.ROSTER_SELECT_FILTER),
        sel2: RosterS.as(AXN.ROSTER_SELECT_UPDATE),
        back: BackB.as(AXN.ROSTER_OPEN),
        next: NextB.as(AXN.NOOP, {disabled: true}),
    };
}));


const openSelectRoster = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        info: jsonEmbed({
            type: 'openSelectRoster',
        }),
        sel1: RosterSF.as(AXN.ROSTER_SELECT_FILTER),
        sel2: RosterS.as(AXN.ROSTER_SELECT_UPDATE),
        back: BackB.fwd(AXN.ROSTER_OPEN),
        next: s.next?.withFwd(ax.id, '', {disabled: true}),
    };
}));


const updateSelectRoster = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        info: jsonEmbed({
            type: 'selectRoster',
        }),
        sel1: RosterSF.as(AXN.ROSTER_SELECT_FILTER),
        sel2: RosterS.as(AXN.ROSTER_SELECT_UPDATE),
        back: BackB.fwd(AXN.ROSTER_OPEN),
        next: s.next?.withFwd(ax.id, '', {disabled: false}),
    };
}));


export const reducerRoster = {
    [AXN.ROSTER_JOIN_OPEN.predicate]    : joinRoster,
    [AXN.ROSTER_SELECT_OPEN.predicate]  : openSelectRoster,
    [AXN.ROSTER_SELECT_UPDATE.predicate]: updateSelectRoster,
    [AXN.ROSTER_SELECT_FILTER.predicate]: updateSelectRoster,
};
