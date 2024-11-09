import type {CommandSpec} from '#src/aws-lambdas/menu/old/types.ts';
import {E, pipe, S} from '#src/internals/re-exports/effect.ts';
import type {CmdOps} from '#src/aws-lambdas/slash/types.ts';
import type {CmdIx} from '#src/internals/re-exports/discordjs.ts';
import {CMDT, CMDOPT} from '#src/internals/re-exports/discordjs.ts';
import {OPTION_TZ} from '#src/aws-lambdas/slash/options.ts';
import {getDiscordUser, putDiscordUser} from '#src/database/discord-user.ts';
import {SlashError, SlashUserError} from '#src/internals/errors/slash-error.ts';
import {validateServer} from '#src/aws-lambdas/slash/utils.ts';
import {omit} from 'effect/Struct';

export const USER
    = {
        type       : CMDT.ChatInput,
        name       : 'user',
        description: 'update user settings',
        options    : {
            tz: {
                ...OPTION_TZ.tz,
                required: true,
            },
            quiet_hours_start: {
                type       : CMDOPT.String,
                name       : 'quiet_hours_start',
                description: 'hours not to be pinged',
                choices    : Array(24).fill(0).map((_, idx) => ({
                    name : `${idx.toString().padStart(2, '0')}:00`,
                    value: `${idx.toString().padStart(2, '0')}:00`,
                })),
            },
            quiet_hours_end: {
                type       : CMDOPT.String,
                name       : 'quiet_hours_end',
                description: 'hours not to be pinged',
                choices    : Array(24).fill(0).map((_, idx) => ({
                    name : `${idx.toString().padStart(2, '0')}:00`,
                    value: `${idx.toString().padStart(2, '0')}:00`,
                })),
            },
            discord_user: {
                type       : CMDOPT.User,
                name       : 'discord_user',
                description: '[admin_role] discord user to update',
            },
        },
    } as const satisfies CommandSpec;

/**
 * @desc [SLASH /user]
 */
export const user = (data: CmdIx, options: CmdOps<typeof USER>) => E.gen(function * () {
    if (!data.member) {
        return yield * new SlashUserError({issue: 'Contextual authentication failed.'});
    }

    if (Boolean(options.quiet_hours_start) !== Boolean(options.quiet_hours_end)) {
        return yield * new SlashUserError({issue: 'must have both quiet hours start/end defined'});
    }

    const userId = options.discord_user ?? data.member.user.id;

    if (options.discord_user) {
        const [server] = yield * validateServer(data);

        if (!data.member.roles.includes(server.admin)) {
            return yield * new SlashUserError({issue: 'admin role required'});
        }
    }

    const user = yield * getDiscordUser({pk: `u-${userId}`})
        .pipe(
            E.catchTag('DeepFryerDynamoError', () => E.succeed(undefined)),
        );

    if (!user) {
        yield * putDiscordUser(pipe(
            {
                type   : 'DiscordUser',
                pk     : `u-${userId}`,
                sk     : 'now',
                version: '1.0.0',
                created: new Date(Date.now()),
                updated: new Date(Date.now()),

                gsi_all_user_id: `u-${userId}`,

                timezone: yield * S.decodeUnknown(S.TimeZone)(options.tz),
                quiet   : options.quiet_hours_start
                    ? `${options.quiet_hours_start}-${options.quiet_hours_end}`
                    : undefined,
            } as const,
            (r) => r.quiet
                ? omit('quiet')(r)
                : r,
        ));

        return {embeds: [{description: `<@${userId}> new user registration successful`}]};
    }

    yield * putDiscordUser({
        ...user,
        updated : new Date(Date.now()),
        timezone: yield * S.decodeUnknown(S.TimeZone)(options.tz),
    });

    return {embeds: [{description: `<@${userId}> user registration updated`}]};
}).pipe(
    E.catchTag('ParseError', (e) => new SlashError({original: e})),
);
