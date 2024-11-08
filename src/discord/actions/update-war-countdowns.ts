import type {Clan, ClanWar} from 'clashofclans.js';
import {E} from '#src/internals/re-exports/effect.ts';
import type {DClan} from '#src/database/discord-clan.ts';
import {DiscordREST} from 'dfx';

export const nicknames = {
    'ClashTest Dummy': 'CTD',
    'DFFP Labs'      : 'Labs',
    'DFFP EZ CWL'    : 'EZCWL',
} as const;

export const updateWarCountdown = (clan: DClan, apiClan: Clan, apiWar: ClanWar) => E.gen(function* () {
    const cname = apiClan.name in nicknames
        ? nicknames[apiClan.name as keyof typeof nicknames]
        : apiClan.name;

    const discord = yield * DiscordREST;

    if (apiWar.isPreparationDay) {
        const time = new Date(apiWar.startTime.getTime() - Date.now());
        const timeleft = `${time.getUTCHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

        return yield * discord.modifyChannel(clan.countdown, {
            name: `🛠️│${cname}│${timeleft}`,
        });
    }
    else if (apiWar.isBattleDay) {
        const time = new Date(apiWar.endTime.getTime() - Date.now());
        const timeleft = `${time.getUTCHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

        return yield * discord.modifyChannel(clan.countdown, {
            name: `🗡│${cname}│${timeleft}`,
        });
    }
    else {
        return yield * discord.modifyChannel(clan.countdown, {
            name: `💤│${cname}`,
        });
    }
});
