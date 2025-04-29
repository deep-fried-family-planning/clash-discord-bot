import {readItem} from '#src/database/db.ts';
import type {IxD} from '#src/internal/discord-old/discord.ts';
import {replyError, SlashUserError} from '#src/internal/errors.ts';
import {E} from '#src/internal/pure/effect.ts';
import { Server } from '#src/database/data/codec';

export const validateServer = (data: IxD) => E.gen(function* () {
  if (!data.member) {
    return yield* new SlashUserError({issue: 'Contextual authentication failed.'});
  }

  const server = yield* readItem(Server, data.guild_id!, 'now')
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
