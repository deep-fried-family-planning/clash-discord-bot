import {typeRx} from '#src/discord/ixc/reducers/type-rx.ts';
import {E} from '#src/internal/pure/effect.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {AccountsB, ClansB, NewLinkB, RosterAdminB, RosterJoinB} from '#src/discord/ixc/components/components.ts';
import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {CloseB} from '#src/discord/ixc/components/global-components.ts';
import type {snflk} from '#src/discord/types.ts';
import {ClanB} from '#src/discord/ixc/component-reducers/select-clan.ts';
import {ViewClanB} from '#src/discord/ixc/component-reducers/view-clan.ts';
import {UserB} from '#src/discord/ixc/component-reducers/edit-user.ts';


const entryLinks = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        info: jsonEmbed({
            type: 'entryLinks',
        }),
        row1: [
            NewLinkB.as(AXN.NLINK_OPEN),
            AccountsB.as(AXN.ACCOUNTS_OPEN),
            UserB.as(AXN.USER_OPEN),
        ],
    };
}));


const openInfo = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        info: jsonEmbed({
            type: 'openInfo',
        }),
        row1: [
            ClanB.forward(ViewClanB.id),
            UserB.forward(RosterJoinB.id),
        ],
    };
}));


const openRoster = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        info: jsonEmbed({
            type: 'openRoster',
        }),
        row1: [
            RosterJoinB,
            RosterAdminB
                .if(s.user_roles.includes(s.server!.admin as snflk))
                ?.as(AXN.ROSTER_ADMIN_OPEN),
        ],
    };
}));


export const reducerEntry = {
    [AXN.LINKS_ENTRY.predicate] : entryLinks,
    [AXN.LINKS_OPEN.predicate]  : entryLinks,
    [AXN.INFO_ENTRY.predicate]  : openInfo,
    [AXN.INFO_OPEN.predicate]   : openInfo,
    [AXN.ROSTER_ENTRY.predicate]: openRoster,
    [AXN.ROSTER_OPEN.predicate] : openRoster,
};