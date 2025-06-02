import {Server} from '#src/data/index.ts';
import {replyError, SlashUserError} from '#src/internal/errors.ts';
import * as E from 'effect/Effect';
import type {Discord} from 'dfx';

export const validateServer = (data: Discord.APIInteraction) => E.gen(function* () {
  if (!data.member) {
    return yield* new SlashUserError({issue: 'Contextual authentication failed.'});
  }

  const server = yield* Server.read({
      Key: {
        pk: data.guild_id!,
        sk: '@',
      },
    })
    .pipe(replyError('Server is not registered.'));

  if (!server.Item) {
    return yield* new SlashUserError({issue: 'Contextual authentication failed.'});
  }

  return [server.Item, data.member] as const;
});
