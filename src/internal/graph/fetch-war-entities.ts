import type {SharedOptions} from '#src/internal/old/types.ts';
import {ClashOfClans} from '#src/service/ClashOfClans.ts';
import type {Clan, ClanWar, ClanWarLeagueGroup, Player} from 'clashofclans.js';
import * as E from 'effect/Effect';

type Kinda = {options: SharedOptions; currentWar: ClanWar[]; current: {clans: Clan[]; cwl: ClanWarLeagueGroup; players: Player[]; wars: ClanWar[]}};

export const fetchWarEntities = (ops: SharedOptions) => E.gen(function* () {
  const cwl = yield* ClashOfClans.getClanWarLeagueGroup(ops.cid1).pipe(E.catchAll(() => E.succeed(null)));

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
    const wars = yield* ClashOfClans.getWars(ops.cid1);
    const cwars = wars.filter((w) => w.state !== 'notInWar');

    returnable.currentWar = cwars;
    returnable.current.wars = cwars;
    returnable.current.players = yield* ClashOfClans.getPlayers([
      ...cwars.map((c) => [
        ...c.clan.members.map((m) => m.tag),
        ...c.opponent.members.map((m) => m.tag),
      ]),
    ].flat());
    returnable.current.clans = yield* ClashOfClans.getClans([
      ops.cid1,
      ...cwars.map((c) => c.opponent.tag),
    ].flat());
  }
  else {
    const war = yield* ClashOfClans.getClanWar(ops.cid1);

    if (war.state !== 'notInWar') {
      returnable.currentWar = [war];
      returnable.current.wars = [war];
      returnable.current.players = yield* ClashOfClans.getPlayers([
        ...war.clan.members.map((m) => m.tag),
        ...war.opponent.members.map((m) => m.tag),
      ]);
      returnable.current.clans = yield* ClashOfClans.getClans([
        ops.cid1,
        war.opponent.tag,
      ]);
    }
  }

  return returnable;
});
