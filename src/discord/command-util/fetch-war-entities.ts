import {api_coc} from '#src/lambdas/client-api-coc.ts';
import {pipe} from 'fp-ts/function';
import {concatL, filterL, flattenL, mapL} from '#src/data/pure-list.ts';
import type {SharedOptions} from '#src/discord/command-util/shared-options.ts';
import type {Clan, ClanWar} from 'clashofclans.js';

export type CurrentEntities = Awaited<ReturnType<typeof fetchWarEntities>>;

export const fetchWarEntities = async (ops: SharedOptions) => {
    const clan = await api_coc.getClan(ops.cid1);

    if (clan.warLeague?.id !== 48000000) {
        try {
            const cwl = await api_coc.getClanWarLeagueGroup(ops.cid1);

            if (cwl.state === 'ended') {
                const players = await clan.fetchMembers();
                const war = await api_coc.getCurrentWar(ops.cid1);

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

                const warClan = await api_coc.getClan(war.opponent.tag);
                const warPlayers = await warClan.fetchMembers();

                return {
                    options   : ops,
                    currentWar: [war],
                    current   : {
                        clans  : [clan, warClan],
                        players: concatL(warPlayers)(players),
                        wars   : [war],
                    },
                };
            }

            const cids = pipe(cwl.clans, mapL((c) => c.tag));
            const clans = await api_coc.getClans(cids);
            const wars = await cwl.getWars();
            const refWars = await cwl.getWars(ops.cid1);
            const players = await pipe(cwl.clans, mapL(async (c) => await c.fetchMembers()), async (ps) => await Promise.all(ps));

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
        catch (e) {
            const players = await clan.fetchMembers();
            const war = await api_coc.getCurrentWar(ops.cid1);

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

            const warClan = await api_coc.getClan(war.opponent.tag);
            const warPlayers = await warClan.fetchMembers();

            return {
                options   : ops,
                currentWar: [war],
                current   : {
                    clans  : [clan, warClan],
                    players: concatL(warPlayers)(players),
                    wars   : [war],
                },
            };
        }
    }

    const players = await clan.fetchMembers();
    const war = await api_coc.getCurrentWar(ops.cid1);

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

    const warClan = await api_coc.getClan(war.opponent.tag);
    const warPlayers = await warClan.fetchMembers();

    return {
        options   : ops,
        currentWar: [war],
        current   : {
            clans  : [clan, warClan],
            players: concatL(warPlayers)(players),
            wars   : [war],
        },
    };
};
