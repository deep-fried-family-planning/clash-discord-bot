import type {CommandSpec, Interaction} from '#src/discord/types.ts';
import {E, S} from '#src/internals/re-exports/effect.ts';
import type {ROptions} from '#src/aws-lambdas/slash/types.ts';
import {CMDT, OPT} from '#src/internals/re-exports/discordjs.ts';
import {OPTION_TZ} from '#src/aws-lambdas/slash/shared-options.ts';
import {getDiscordUser, putDiscordUser} from '#src/database/discord-user.ts';
import {SlashUserError} from '#src/internals/errors/slash-error.ts';
import {validateServer} from '#src/aws-lambdas/slash/validation-utils.ts';

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
            discord_user: {
                type       : OPT.User,
                name       : 'discord_user',
                description: '[admin_role] discord user to update',
            },
        },
    } as const satisfies CommandSpec;

/**
 * @desc [SLASH /user]
 */
export const user = (data: Interaction, options: ROptions<typeof USER>) => E.gen(function * () {
    if (!data.member) {
        return yield * new SlashUserError({issue: 'Contextual authentication failed.'});
    }

    const userId = options.discord_user ?? data.member.user.id;

    if (options.discord_user) {
        const [server] = yield * validateServer(data);

        if (!data.member.roles.includes(server.admin)) {
            return yield * new SlashUserError({issue: 'admin role required'});
        }
    }

    const user = yield * getDiscordUser({pk: `user-${userId}`})
        .pipe(
            E.catchTag('DeepFryerDynamoError', () => E.succeed(undefined)),
        );

    if (!user) {
        yield * putDiscordUser({
            type    : 'DiscordUser',
            pk      : `user-${userId}`,
            sk      : 'now',
            version : '1.0.0',
            created : new Date(Date.now()),
            updated : new Date(Date.now()),
            timezone: yield * S.decodeUnknown(S.TimeZone)(options.tz),
        });

        return {embeds: [{description: `<@${userId}> new user registration successful`}]};
    }

    yield * putDiscordUser({
        ...user,
        updated : new Date(Date.now()),
        timezone: yield * S.decodeUnknown(S.TimeZone)(options.tz),
    });

    return {embeds: [{description: `<@${userId}> user registration updated`}]};
});
