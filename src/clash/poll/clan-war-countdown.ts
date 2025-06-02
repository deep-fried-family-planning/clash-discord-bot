import {ClashOfClans} from '#src/service/ClashOfClans.ts';
import type {Clan} from '#src/data/index.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {ClanWar} from 'clashofclans.js';
import {DiscordREST} from 'dfx/DiscordREST';
import * as E from 'effect/Effect';

export const nicknames = {
  'ClashTest Dummy': 'CTD',
  'DFFP Labs'      : 'Labs',
  'DFFP EZ CWL'    : 'EZCWL',
  'DFFP Sh t Hits' : 'Shit Hits',
} as const;

const channel_names = {
  none: (name: str) => ({name: `💤│${name}`}),
  prep: (name: str, time: str) => ({name: `🛠️│${name}│${time}`}),
  batt: (name: str, time: str) => ({name: `🗡│${name}│${time}`}),
} as const;

export const updateWarCountdown = (clan: Clan, apiWars: ClanWar[]) => E.gen(function* () {
  const discord = yield* DiscordREST;
  const apiClan = yield* ClashOfClans.getClan(clan.sk);

  const cname = apiClan.name in nicknames
    ? nicknames[apiClan.name as keyof typeof nicknames]
    : apiClan.name;

  if (!clan.countdown) {
    return;
  }

  if (apiWars.length === 0) {
    yield* discord.updateChannel(clan.countdown, {
      name: `💤│${cname}`,
    });
  }

  if (apiWars.length === 1) {
    const [apiWar] = apiWars;

    if (apiWar.isPreparationDay) {
      const time = new Date(apiWar.startTime.getTime() - Date.now());
      const timeleft = `${time.getUTCHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

      yield* discord.updateChannel(clan.countdown, channel_names.prep(cname, timeleft));
    }
    else if (apiWar.isBattleDay) {
      const time = new Date(apiWar.endTime.getTime() - Date.now());
      const timeleft = `${time.getUTCHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

      yield* discord.updateChannel(clan.countdown, channel_names.batt(cname, timeleft));
    }
    else {
      yield* discord.updateChannel(clan.countdown, channel_names.none(cname));
    }
  }
  else if (apiWars.length === 2) {
    const apiWar = apiWars.find((w) => w.isBattleDay)!;

    const time = new Date(apiWar.endTime.getTime() - Date.now());
    const timeleft = `${time.getUTCHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

    yield* discord.updateChannel(clan.countdown, channel_names.batt(cname, timeleft));
  }

  return cname;
});
