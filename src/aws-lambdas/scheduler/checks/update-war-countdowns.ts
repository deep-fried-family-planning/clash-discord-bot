import type {ClanWar} from 'clashofclans.js';
import {E} from '#src/internals/re-exports/effect.ts';
import type {DClan} from '#src/database/discord-clan.ts';
import {DiscordREST} from 'dfx';
import {ClashperkService} from '#src/internals/layers/clashperk-service.ts';

export const nicknames = {
    'ClashTest Dummy': 'CTD',
    'DFFP Labs'      : 'Labs',
    'DFFP EZ CWL'    : 'EZCWL',
} as const;

export const updateWarCountdown = (clan: DClan, apiWars: ClanWar[]) => E.gen(function* () {
    const apiClan = yield * ClashperkService.getClan(clan.sk);

    const cname = apiClan.name in nicknames
        ? nicknames[apiClan.name as keyof typeof nicknames]
        : apiClan.name;

    const discord = yield * DiscordREST;

    if (apiWars.length === 0) {
        yield * discord.modifyChannel(clan.countdown, {
            name: `💤│${cname}`,
        });
    }

    if (apiWars.length === 1) {
        const [apiWar] = apiWars;

        if (apiWar.isPreparationDay) {
            const time = new Date(apiWar.startTime.getTime() - Date.now());
            const timeleft = `${time.getUTCHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

            yield * discord.modifyChannel(clan.countdown, {
                name: `🛠️│${cname}│${timeleft}`,
            });
        }
        else if (apiWar.isBattleDay) {
            const time = new Date(apiWar.endTime.getTime() - Date.now());
            const timeleft = `${time.getUTCHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

            yield * discord.modifyChannel(clan.countdown, {
                name: `🗡│${cname}│${timeleft}`,
            });
        }
        else {
            yield * discord.modifyChannel(clan.countdown, {
                name: `💤│${cname}`,
            });
        }
    }
    else if (apiWars.length === 2) {
        const apiWar = apiWars.find((w) => w.isBattleDay)!;

        const time = new Date(apiWar.endTime.getTime() - Date.now());
        const timeleft = `${time.getUTCHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

        yield * discord.modifyChannel(clan.countdown, {
            name: `🗡│${cname}│${timeleft}`,
        });
    }

    return cname;
});
