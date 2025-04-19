import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {DiscordApi} from '#src/internal/discord-old/layer/discord-api.ts';
import type {DClan} from '#src/dynamo/schema/discord-clan.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {ClanWar} from 'clashofclans.js';



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


export const updateWarCountdown = (clan: DClan, apiWars: ClanWar[]) => E.gen(function* () {
  const apiClan = yield * ClashOfClans.getClan(clan.sk);

  const cname = apiClan.name in nicknames
    ? nicknames[apiClan.name as keyof typeof nicknames]
    : apiClan.name;

  if (apiWars.length === 0) {
    yield * DiscordApi.modifyChannel(clan.countdown, {
      name: `💤│${cname}`,
    });
  }

  if (apiWars.length === 1) {
    const [apiWar] = apiWars;

    if (apiWar.isPreparationDay) {
      const time     = new Date(apiWar.startTime.getTime() - Date.now());
      const timeleft = `${time.getUTCHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

      yield * DiscordApi.modifyChannel(clan.countdown, channel_names.prep(cname, timeleft));
    }
    else if (apiWar.isBattleDay) {
      const time     = new Date(apiWar.endTime.getTime() - Date.now());
      const timeleft = `${time.getUTCHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

      yield * DiscordApi.modifyChannel(clan.countdown, channel_names.batt(cname, timeleft));
    }
    else {
      yield * DiscordApi.modifyChannel(clan.countdown, channel_names.none(cname));
    }
  }
  else if (apiWars.length === 2) {
    const apiWar = apiWars.find((w) => w.isBattleDay)!;

    const time     = new Date(apiWar.endTime.getTime() - Date.now());
    const timeleft = `${time.getUTCHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

    yield * DiscordApi.modifyChannel(clan.countdown, channel_names.batt(cname, timeleft));
  }

  return cname;
});
