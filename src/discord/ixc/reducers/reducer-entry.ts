import {typeRx} from '#src/discord/ixc/reducers/type-rx.ts';
import {E} from '#src/internal/pure/effect.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {AccountsB, NewLinkB, RosterAdminB} from '#src/discord/ixc/components/components.ts';
import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import type {snflk} from '#src/discord/types.ts';
import {ClanB} from '#src/discord/ixc/view-reducers/clan-select.ts';
import {ViewClanB} from '#src/discord/ixc/view-reducers/clan-viewer.ts';
import {UserB} from '#src/discord/ixc/view-reducers/user-edit.ts';
import {SelectRosterB} from '#src/discord/ixc/view-reducers/roster-select.ts';
import {SignupRosterB} from '#src/discord/ixc/view-reducers/roster-signup.ts';
import {RosterManageB} from '#src/discord/ixc/view-reducers/roster-manage.ts';
import {OptoutRosterB} from '#src/discord/ixc/view-reducers/roster-opt-out.ts';
import {IXCBS} from '#src/discord/util/discord.ts';


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
        ],
    };
}));


const openRoster = typeRx((s, ax) => E.gen(function * () {
    return {
        ...s,
        title: 'Rosters',
        row1 : [
            SelectRosterB
                .render(SignupRosterB.options)
                .fwd(SignupRosterB.id),
            SelectRosterB
                .render(OptoutRosterB.options)
                .fwd(OptoutRosterB.id),
            RosterManageB
                .if(s.user_roles.includes(s.server!.admin as snflk)),
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
