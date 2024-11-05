import {E} from '#src/utils/effect';
import type {Clan, ClanWar} from 'clashofclans.js';
import {nicknames} from '#src/discord/actions/update-war-countdowns.ts';
import {DiscordREST} from 'dfx';
import type {DServer} from '#src/database/discord-server.ts';
import type {DClan} from '#src/database/discord-clan.ts';
import {discord as old} from '#src/https/api-discord.ts';
import type {DPlayer} from '#src/database/discord-player.ts';
import {pipe} from 'effect';
import {mapL, reduceL} from '#src/pure/pure-list.ts';

export const createWarThread = (server: DServer, clan: DClan, players: Record<string, DPlayer>, apiClan: Clan, apiWar: ClanWar) => E.gen(function *() {
    const discord = yield * DiscordREST;

    const cname = apiClan.name in nicknames
        ? nicknames[apiClan.name as keyof typeof nicknames]
        : apiClan.name;

    const enemyclan = apiClan.tag === apiWar.clan.tag
        ? apiWar.opponent
        : apiWar.clan;

    // nothing -> battle
    // nothing -> war prep
    // prep -> battle
    // battle -> nothing

    if (apiWar.isPreparationDay && enemyclan.tag !== clan.prep_opponent) {
        const result = yield * E.tryPromise(() => old.channels.createForumThread(server.forum!, {
            name                 : `🛠️│${cname}`,
            auto_archive_duration: 1440,
            message              : {
                content: `${apiClan.name} vs. ${enemyclan.name}`,
            },
        }));
        yield * discord.createMessage(result.id, {
            content: pipe(
                apiWar.clan.members,
                mapL((m) => players[m.tag]
                    ? `<@${players[m.tag].pk.split('user-')[1]}>`
                    : m.tag,
                ),
                reduceL('', (acc, a) => acc.concat(`\n${a}`)),
            ),
        });

        return {
            ...clan,
            updated      : new Date(Date.now()),
            prep_opponent: enemyclan.tag,
            thread_prep  : result.id,
        };
    }

    else if (apiWar.isBattleDay && enemyclan.tag !== clan.prep_opponent && enemyclan.tag !== clan.battle_opponent) {
        const result = yield * E.tryPromise(() => old.channels.createForumThread(server.forum!, {
            name                 : `🗡️│${cname}`,
            auto_archive_duration: 1440,
            message              : {
                content: `${apiClan.name} vs. ${enemyclan.name}`,
            },
        }));
        yield * discord.createMessage(result.id, {
            content: pipe(
                apiWar.clan.members,
                mapL((m) => players[m.tag]
                    ? `<@${players[m.tag].pk.split('user-')[1]}>`
                    : m.tag,
                ),
                reduceL('', (acc, a) => acc.concat(`\n${a}`)),
            ),
        });

        return {
            ...clan,
            updated        : new Date(Date.now()),
            battle_opponent: enemyclan.tag,
            thread_battle  : result.id,
        };
    }

    else if (apiWar.isBattleDay && enemyclan.tag === clan.prep_opponent && enemyclan.tag !== clan.battle_opponent) {
        yield * discord.modifyChannel(clan.thread_prep, {
            name: `🗡│${cname}`,
        }, {});
        yield * discord.createMessage(clan.thread_prep, {
            content: 'war started',
        });

        return {
            ...clan,
            updated        : new Date(Date.now()),
            battle_opponent: enemyclan.tag,
            thread_battle  : clan.thread_prep,
        };
    }

    else if (apiWar.isWarEnded && enemyclan.tag === clan.battle_opponent) {
        yield * discord.createMessage(clan.thread_battle, {
            content: `war ended in ${apiWar.status}`,
        });
        yield * discord.modifyChannel(clan.thread_battle, {
            name    : `🗂️│${cname}│${apiWar.endTime.toDateString()}│${apiWar.status}`,
            archived: true,
            locked  : true,
        });

        return {
            ...clan,
            updated        : new Date(Date.now()),
            battle_opponent: '',
            thread_battle  : '',
        };
    }

    return clan;
});
