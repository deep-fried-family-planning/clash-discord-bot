import {ClashOfClans} from '#src/clash/clashofclans.ts';
import type {SharedOptions} from '#src/discord/types.ts';
import {E, g} from '#src/internal/pure/effect.ts';
import type {WarThreadData} from '#src/task/war-thread/common.ts';
import type {Clan, ClanWar, ClanWarLeagueGroup, Player} from 'clashofclans.js';


type Kinda = {options: SharedOptions; currentWar: ClanWar[]; current: {clans: Clan[]; cwl: ClanWarLeagueGroup; players: Player[]; wars: ClanWar[]}};

export const fetchWarEntities = (ops: SharedOptions) => E.gen(function * () {
    const cwl = yield * ClashOfClans.getClanWarLeagueGroup(ops.cid1).pipe(E.catchAll(() => E.succeed(null)));

    const returnable = {
        options   : ops,
        currentWar: [],
        current   : {
            clans  : [],
            cwl,
            players: [],
            wars   : [],
        },
    } as Kinda;


    if (cwl) {
        const wars = yield * ClashOfClans.getWars(ops.cid1);
        const cwars = wars.filter((w) => w.state !== 'notInWar');

        returnable.currentWar = cwars;
        returnable.current.wars = cwars;
        returnable.current.players = yield * ClashOfClans.getPlayers([
            ...cwars.map((c) => [
                ...c.clan.members.map((m) => m.tag),
                ...c.opponent.members.map((m) => m.tag),
            ]),
        ].flat());
        returnable.current.clans = yield * ClashOfClans.getClans([
            ops.cid1,
            ...cwars.map((c) => c.opponent.tag),
        ].flat());
    }
    else {
        const war = yield * ClashOfClans.getClanWar(ops.cid1);

        if (war.state !== 'notInWar') {
            returnable.currentWar = [war];
            returnable.current.wars = [war];
            returnable.current.players = yield * ClashOfClans.getPlayers([
                ...war.clan.members.map((m) => m.tag),
                ...war.opponent.members.map((m) => m.tag),
            ]);
            returnable.current.clans = yield * ClashOfClans.getClans([
                ops.cid1,
                war.opponent.tag,
            ]);
        }
    }

    return returnable;
});


export const getTaskWars = (data: typeof WarThreadData.Type) => g(function * () {
    const entities = yield * fetchWarEntities({
        cid1       : data.clan.sk,
        exhaustive : false,
        from       : 0,
        limit      : 50,
        showCurrent: false,
        showN      : false,
        to         : 50,
    });

    return {
        prep    : entities.current.wars.find((w) => w.state === 'preparation')!,
        battle  : entities.current.wars.find((w) => w.state === 'inWar')!,
        finished: entities.current.wars.find((w) => w.state === 'notInWar') ?? entities.current.wars.find((w) => w.state !== 'inWar')!,
        original: entities,
    };
});
