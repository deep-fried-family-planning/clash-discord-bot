import type {CmdIx} from '#src/internals/re-exports/discordjs.ts';
import {replyError, SlashUserError} from '#src/internals/errors/slash-error.ts';
import {E} from '#src/internals/re-exports/effect.ts';
import {getDiscordServer} from '#src/database/discord-server.ts';

export const validateServer = (data: CmdIx) => E.gen(function * () {
    if (!data.member) {
        return yield * new SlashUserError({issue: 'Contextual authentication failed.'});
    }

    const server
        = yield * getDiscordServer({pk: `server-${data.guild_id}`, sk: 'now'})
            .pipe(replyError('Server is not registered.'));

    return [server, data.member] as const;
});

export const buildCloudWatchLink = () =>
    `https://${process.env.AWS_REGION}.console.aws.amazon.com/cloudwatch/home?`
    + `region=${process.env.AWS_REGION}`
    + `#logsV2:log-groups/log-group/`
    + encodeURIComponent(process.env.AWS_LAMBDA_LOG_GROUP_NAME)
    + '/log-events/'
    + encodeURIComponent(process.env.AWS_LAMBDA_LOG_STREAM_NAME);
