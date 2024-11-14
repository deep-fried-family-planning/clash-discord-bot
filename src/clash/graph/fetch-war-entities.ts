import {concatL, filterL, flattenL, mapL} from '#src/internal/pure/pure-list.ts';
import type {Clan, ClanWar} from 'clashofclans.js';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import type {SharedOptions} from '#src/discord/types.ts';

export const fetchWarEntities = (ops: SharedOptions) => E.gen(function * () {
    const clan = yield * Clashofclans.getClan(ops.cid1);

    if (clan.warLeague?.id !== 48000000) {
        try {
            const cwl = yield * Clashofclans.getClanWarLeagueGroup(ops.cid1);

            if (cwl.state === 'ended') {
                const players = yield * E.promise(async () => await clan.fetchMembers());
                const war = yield * Clashofclans.getCurrentWar(ops.cid1);

                if (!war || war.isWarEnded) {
                    return {
                        options   : ops,
                        currentWar: [] as ClanWar[],
                        current   : {
                            clans: [] as Clan[],
                            cwl,
                            players,
                            wars : [] as ClanWar[],
                        },
                    };
                }

                const warClan = yield * Clashofclans.getClan(war.opponent.tag);
                const warPlayers = yield * E.promise(async () => await warClan.fetchMembers());

                return {
                    options   : ops,
                    currentWar: [war],
                    current   : {
                        clans  : [clan, warClan],
                        players: pipe(players, concatL(warPlayers)),
                        wars   : [war],
                    },
                };
            }

            const cids = pipe(cwl.clans, mapL((c) => c.tag));
            const clans = yield * Clashofclans.getClans(cids);
            const wars = yield * E.promise(async () => await cwl.getWars());
            const refWars = yield * E.promise(async () => await cwl.getWars(ops.cid1));
            const players = yield * pipe(
                cwl.clans,
                mapL((c) => E.promise(async () => await c.fetchMembers())),
                E.allWith({concurrency: 'unbounded'}),
            );

            const currentWar = pipe(
                refWars,
                filterL((w) => w.isPreparationDay),
            );

            return {
                options: ops,
                current: {
                    clans,
                    wars,
                    players: flattenL(players),
                },
                currentWar,
            };
        }

        catch (_) {
            const players = yield * E.promise(async () => await clan.fetchMembers());
            const war = yield * Clashofclans.getCurrentWar(ops.cid1);

            if (!war || war.isWarEnded) {
                return {
                    options   : ops,
                    currentWar: [] as ClanWar[],
                    current   : {
                        clans: [] as Clan[],
                        players,
                        wars : [] as ClanWar[],
                    },
                };
            }

            const warClan = yield * Clashofclans.getClan(war.opponent.tag);
            const warPlayers = yield * E.promise(async () => await warClan.fetchMembers());

            return {
                options   : ops,
                currentWar: [war],
                current   : {
                    clans  : [clan, warClan],
                    players: pipe(players, concatL(warPlayers)),
                    wars   : [war],
                },
            };
        }
    }

    const players = yield * E.promise(async () => await clan.fetchMembers());
    const war = yield * Clashofclans.getCurrentWar(ops.cid1);

    if (!war || war.isWarEnded) {
        return {
            options   : ops,
            currentWar: [] as ClanWar[],
            current   : {
                clans: [] as Clan[],
                players,
                wars : [] as ClanWar[],
            },
        };
    }

    const warClan = yield * Clashofclans.getClan(war.opponent.tag);
    const warPlayers = yield * E.promise(async () => await warClan.fetchMembers());

    return {
        options   : ops,
        currentWar: [war],
        current   : {
            clans  : [clan, warClan],
            players: pipe(players, concatL(warPlayers)),
            wars   : [war],
        },
    };
});
