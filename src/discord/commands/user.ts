import type {CommandSpec, IxDS, snflk} from '#src/discord/types.ts';
import {E, pipe, S} from '#src/internal/pure/effect.ts';
import type {IxD} from '#src/internal/discord.ts';
import {getDiscordUser, putDiscordUser} from '#src/dynamo/schema/discord-user.ts';
import {omit} from 'effect/Struct';
import {OPTION_TZ} from '#src/constants/ix-constants.ts';
import {validateServer} from '#src/discord/util/validation.ts';
import {SlashError, SlashUserError} from '#src/internal/errors.ts';
import {decodeTimezone} from '#src/dynamo/schema/common-decoding.ts';


export const USER
    = {
        type       : 1,
        name       : 'user',
        description: 'update user settings',
        options    : {
            tz: {
                ...OPTION_TZ.tz,
                required: true,
            },
            quiet_hours_start: {
                type       : 3,
                name       : 'quiet_hours_start',
                description: 'hours not to be pinged',
                choices    : Array(24).fill(0).map((_, idx) => ({
                    name : `${idx.toString().padStart(2, '0')}:00`,
                    value: `${idx.toString().padStart(2, '0')}:00`,
                })),
            },
            quiet_hours_end: {
                type       : 3,
                name       : 'quiet_hours_end',
                description: 'hours not to be pinged',
                choices    : Array(24).fill(0).map((_, idx) => ({
                    name : `${idx.toString().padStart(2, '0')}:00`,
                    value: `${idx.toString().padStart(2, '0')}:00`,
                })),
            },
            discord_user: {
                type       : 6,
                name       : 'discord_user',
                description: '[admin_role] discord user to update',
            },
        },
    } as const satisfies CommandSpec;


/**
 * @desc [SLASH /user]
 */
export const user = (data: IxD, options: IxDS<typeof USER>) => E.gen(function * () {
    if (!data.member) {
        return yield * new SlashUserError({issue: 'Contextual authentication failed.'});
    }

    if (Boolean(options.quiet_hours_start) !== Boolean(options.quiet_hours_end)) {
        return yield * new SlashUserError({issue: 'must have both quiet hours start/end defined'});
    }

    const userId = options.discord_user ?? data.member.user!.id;

    if (options.discord_user) {
        const [server] = yield * validateServer(data);

        if (!data.member.roles.includes(server.admin as snflk)) {
            return yield * new SlashUserError({issue: 'admin role required'});
        }
    }

    const user = yield * getDiscordUser({pk: userId})
        .pipe(
            E.catchTag('DeepFryerDynamoError', () => E.succeed(undefined)),
        );

    if (!user) {
        yield * putDiscordUser(pipe(
            {
                type   : 'DiscordUser',
                pk     : userId,
                sk     : 'now',
                version: '1.0.0',
                created: new Date(Date.now()),
                updated: new Date(Date.now()),

                gsi_all_user_id: userId,

                timezone: yield * decodeTimezone(options.tz),
                quiet   : options.quiet_hours_start
                    ? `${options.quiet_hours_start}-${options.quiet_hours_end}`
                    : undefined,
            } as const,
            (r) => r.quiet
                ? omit('quiet')(r)
                : r,
        ));

        return {embeds: [{description: `<@${userId}> new user registration successful (${options.tz})`}]};
    }

    yield * putDiscordUser({
        ...user,
        updated : new Date(Date.now()),
        timezone: yield * decodeTimezone(options.tz),
    });

    return {embeds: [{description: `<@${userId}> user registration updated (${options.tz})`}]};
}).pipe(
    E.catchTag('ParseError', (e) => new SlashError({original: e})),
);
