import {buildReducer} from '#src/discord/ixc/reducers/build-reducer.ts';
import {E} from '#src/internal/pure/effect.ts';
import {jsonEmbed} from '#src/discord/util/embed.ts';
import {
    AccountsB,
    ClansB,
    NewLinkB, RosterAdminB,
    RosterJoinB,
    UserB,
} from '#src/discord/ixc/components/components.ts';
import {AXN} from '#src/discord/ixc/reducers/actions.ts';
import {CloseB} from '#src/discord/ixc/components/global-components.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {snflk} from '#src/discord/types.ts';


const entryLinks = buildReducer((s, ax) => E.gen(function * () {
    return {
        ...s,
        view: {
            info: jsonEmbed({
                type: 'entryLinks',
            }),
            rows: [
                [
                    NewLinkB.as(AXN.NEW_LINK_OPEN),
                    AccountsB.as(AXN.ACCOUNTS_OPEN),
                    UserB.as(AXN.USER_OPEN),
                ],
            ],
            close: CloseB,
        },
    };
}));


const openInfo = buildReducer((s, ax) => E.gen(function * () {
    return {
        ...s,
        view: {
            info: jsonEmbed({
                type: 'openInfo',
            }),
            rows: [
                [
                    ClansB.as(AXN.CLANS_OPEN),
                ],
            ],
            close: CloseB,
        },
    };
}));


const openRoster = buildReducer((s, ax) => E.gen(function * () {
    return {
        ...s,
        view: {
            info: jsonEmbed({
                type: 'openRoster',
            }),
            rows: [
                [
                    RosterJoinB,
                    RosterAdminB
                        .if(s.user_roles.includes(s.server!.admin as snflk))
                        ?.as(AXN.ROSTER_ADMIN_OPEN),
                ],
            ],
            close: CloseB,
        },
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
