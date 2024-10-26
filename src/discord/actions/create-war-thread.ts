import type {ServerModel} from '#src/database/codec/server-codec.ts';
import {E, pipe} from '#src/utils/effect';
import type {Clan, ClanWar} from 'clashofclans.js';
import {containsL} from '#src/pure/pure-list.ts';
import {oopTimeout} from '#src/aws-lambdas/scheduler/oop-timeout.ts';
import {discord} from '#src/https/api-discord.ts';
import {ThreadAutoArchiveDuration} from '@discordjs/core/http-only';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {SchedulerService} from '@effect-aws/client-scheduler';
import {nicknames} from '#src/discord/actions/update-war-countdowns.ts';
import {serverCache} from '#src/database/codec/server-cache.ts';

export const createWarThread = (server: ServerModel, clan: Clan, war: ClanWar) => E.gen(function *() {
    const cmeta = server.clans[clan.tag];

    const cname = clan.name in nicknames
        ? nicknames[clan.name as keyof typeof nicknames]
        : clan.name;

    const [serverclan, enemyclan] = clan.tag === war.clan.tag
        ? [war.clan, war.opponent]
        : [war.opponent, war.clan];

    const war_opponent_battle = server.clans[clan.tag].war_battle_opponent;
    const war_opponent_prep = server.clans[clan.tag].war_prep_opponent;

    if (war.isPreparationDay && enemyclan.tag !== cmeta.war_prep_opponent) {
        const thread = yield * oopTimeout('30 seconds', () => discord.channels.createForumThread(server.channels.war_room, {
            name                 : `🛠️│${cname}`,
            auto_archive_duration: 1440,
            message              : {
                content: `${clan.name} vs. ${enemyclan.name}`,
            },
        }));
        yield * serverCache.invalidate(server.id);

        return [clan.tag, {
            ...cmeta,
            war_prep_opponent: enemyclan.tag,
            war_prep_thread  : thread.id,
        }] as const;
    }

    else if (war.isBattleDay && enemyclan.tag === cmeta.war_prep_opponent && enemyclan.tag !== cmeta.war_battle_opponent) {
        yield * oopTimeout('30 seconds',
            () => discord.channels.edit(cmeta.war_prep_thread, {
                name: `🗡│${cname}`,
            }),
        );
        yield * oopTimeout('30 seconds',
            () => discord.channels.createMessage(cmeta.war_prep_thread, {
                content: 'war started',
            }),
        );
        yield * serverCache.invalidate(server.id);

        return [clan.tag, {
            ...cmeta,
            war_battle_opponent: enemyclan.tag,
            war_battle_thread  : cmeta.war_prep_thread,
        }] as const;
    }

    else if (war.isWarEnded && enemyclan.tag === cmeta.war_battle_opponent) {
        // yield * oopTimeout('30 seconds',
        //     () => discord.channels.edit(cmeta.war_prep_thread, {
        //         name: `🗡│${cname}`,
        //     }),
        // );
        // yield * oopTimeout('30 seconds',
        //     () => discord.channels.createMessage(cmeta.war_prep_thread, {
        //         content: 'war started',
        //     }),
        // );
        yield * serverCache.invalidate(server.id);

        return [clan.tag, {
            ...cmeta,
            war_battle_opponent: '',
            war_battle_thread  : '',
        }] as const;
    }

    return [clan.tag, cmeta] as const;
});
