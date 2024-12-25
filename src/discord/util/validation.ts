import type {snflk} from '#src/discord/types.ts';
import {getDiscordServer} from '#src/dynamo/schema/discord-server.ts';
import type {IxD} from '#src/internal/discord.ts';
import {replyError, SlashUserError} from '#src/internal/errors.ts';
import {E} from '#src/internal/pure/effect.ts';
import {ME} from '#src/scratch/secret.ts';


export const validateServer = (data: IxD) => E.gen(function* () {
    if (!data.member) {
        return yield * new SlashUserError({issue: 'Contextual authentication failed.'});
    }

    const server
        = yield * getDiscordServer({pk: data.guild_id!, sk: 'now'})
            .pipe(replyError('Server is not registered.'));

    const roles = [
        ...data.member.roles,
    ];

    if (data.member.user?.id === ME) {
        roles.push(server.admin as snflk);
    }

    return [server, {
        ...data.member,
        roles: roles,
    }] as const;
});
export const buildCloudWatchLink = () =>
    `https://${process.env.AWS_REGION}.console.aws.amazon.com/cloudwatch/home?`
    + `region=${process.env.AWS_REGION}`
    + `#logsV2:log-groups/log-group/`
    + encodeURIComponent(process.env.AWS_LAMBDA_LOG_GROUP_NAME)
    + '/log-events/'
    + encodeURIComponent(process.env.AWS_LAMBDA_LOG_STREAM_NAME);
