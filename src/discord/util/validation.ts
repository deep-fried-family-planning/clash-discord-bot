import type {IxD} from '#src/discord/util/discord.ts';
import {CSL, E} from '#src/internal/pure/effect.ts';
import {getDiscordServer} from '#src/dynamo/schema/discord-server.ts';
import {replyError, SlashUserError} from '#src/internal/errors.ts';

export const validateServer = (data: IxD) => E.gen(function* () {
    yield * CSL.debug('[VALIDATE]:', data);

    if (!data.member) {
        return yield * new SlashUserError({issue: 'Contextual authentication failed.'});
    }

    const server
        = yield * getDiscordServer({pk: data.guild_id!, sk: 'now'})
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
