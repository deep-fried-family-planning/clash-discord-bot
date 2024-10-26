import type {ServerModel} from '#src/database/codec/server-codec.ts';
import type {Clan, ClanWar} from 'clashofclans.js';
import {discord} from '#src/https/api-discord.ts';
import {E, pipe} from '#src/utils/effect.ts';
import {Console} from 'effect';
import {oopTimeout} from '#src/aws-lambdas/scheduler/oop-timeout.ts';

export const nicknames = {
    'ClashTest Dummy': 'CTD',
    'DFFP Labs'      : 'Labs',
    'DFFP EZ CWL'    : 'EZCWL',
} as const;

const ONE_DAY_MS
    = 1000
    * 60
    * 60
    * 24;

export const updateWarCountdown = (clan: Clan, war: ClanWar, server: ServerModel) => E.gen(function* () {
    const cname = clan.name in nicknames
        ? nicknames[clan.name as keyof typeof nicknames]
        : clan.name;

    const [serverclan, enemyclan] = clan.tag === war.clan.tag
        ? [war.clan, war.opponent]
        : [war.opponent, war.clan];

    // const links = yield * playerLinkCache.get(PLAYER_LINK_PLACEHOLDER_KEY);
    //
    // const permissions = pipe(
    //     war.clan.members,
    //     mapL((m) => links.players[m.tag].user),
    //     dedupeL,
    //
    // );

    yield * Console.log(`updating ${clan.tag}`);

    if (war.isPreparationDay) {
        yield * Console.log(`prep ${clan.tag}`);
        const time = new Date(war.startTime.getTime() - Date.now());
        const timeleft = `${time.getUTCHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
        yield * Console.log(`prep ${clan.tag}`);
        yield * oopTimeout('30 seconds', async () => {
            try {
                await discord.channels.edit(
                    server.clans[serverclan.tag].war_countdown_channel,
                    {
                        name: `🛠️│${cname}│${timeleft}`,
                    },
                );
            }
            catch (e) {
                console.error(e);
                throw e;
            }
        });
    }
    else if (war.isBattleDay) {
        yield * Console.log(`battle day ${clan.tag}`);
        const time = new Date(war.endTime.getTime() - Date.now());
        const timeleft = `${time.getUTCHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
        yield * Console.log(`battle day ${clan.tag}`);
        yield * oopTimeout('30 seconds', async () => {
            try {
                await discord.channels.edit(
                    server.clans[serverclan.tag].war_countdown_channel,
                    {
                        name: `🗡│${cname}│${timeleft}`,
                    },
                );
            }
            catch (e) {
                console.error(e);
                throw e;
            }
        });
    }
    else {
        yield * Console.log(`no war ${clan.tag}`);
        yield * oopTimeout('30 seconds', async () => {
            try {
                await discord.channels.edit(
                    server.clans[serverclan.tag].war_countdown_channel,
                    {
                        name: `💤│${cname}`,
                    },
                );
            }
            catch (e) {
                console.error(e);
                throw e;
            }
        });
    }

    return yield * Console.log(`updated ${clan.tag}`);
});
