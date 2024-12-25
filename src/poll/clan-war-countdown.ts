import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import type {DClan} from '#src/dynamo/schema/discord-clan.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {ClanWar} from 'clashofclans.js';


export const nicknames = {
    '#2GR2G0PGG': 'DFFP',
    '#2YVCYUCCP': 'CTD',
    '#2GYYRUULL': 'Labs',
    '#2QUP9UPGY': 'EZCWL',
    '#2RPLPCVLU': 'Shit Hits',

    '#2LV9C2208': 'SA',
    '#2QLQ9CY0J': '2SA',
    '#2QRGLVCL9': '1SA',
    '#2LJYUYCUC': '3SA',
    '#2Q9R80GCU': 'AH',
    '#2RVRCL9PQ': 'Nano',
    '#2RG0GYPC0': 'Micro',
    '#2GQGRVURP': 'Sudo',
} as const;


const channel_names = {
    none: (name: str) => ({name: `💤│${name}`}),
    prep: (name: str, time: str) => ({name: `🛠️│${name}│${time}`}),
    batt: (name: str, time: str) => ({name: `🗡│${name}│${time}`}),
} as const;


export const updateWarCountdown = (clan: DClan, apiWars: ClanWar[]) => E.gen(function* () {
    const apiClan = yield * ClashOfClans.getClan(clan.sk);

    const cname = apiClan.tag in nicknames
        ? nicknames[apiClan.tag as keyof typeof nicknames]
        : apiClan.name;

    if (apiWars.length === 0) {
        yield * DiscordApi.modifyChannel(clan.countdown, {
            name: `💤│${cname}`,
        });
    }

    if (apiWars.length === 1) {
        const [apiWar] = apiWars;

        if (apiWar.isPreparationDay) {
            const time = new Date(apiWar.startTime.getTime() - Date.now());
            const timeleft = `${time.getUTCHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

            yield * DiscordApi.modifyChannel(clan.countdown, channel_names.prep(cname, timeleft));
        }
        else if (apiWar.isBattleDay) {
            const time = new Date(apiWar.endTime.getTime() - Date.now());
            const timeleft = `${time.getUTCHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

            yield * DiscordApi.modifyChannel(clan.countdown, channel_names.batt(cname, timeleft));
        }
        else {
            yield * DiscordApi.modifyChannel(clan.countdown, channel_names.none(cname));
        }
    }
    else if (apiWars.length === 2) {
        const apiWar = apiWars.find((w) => w.isBattleDay)!;

        const time = new Date(apiWar.endTime.getTime() - Date.now());
        const timeleft = `${time.getUTCHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

        yield * DiscordApi.modifyChannel(clan.countdown, channel_names.batt(cname, timeleft));
    }

    return cname;
});
