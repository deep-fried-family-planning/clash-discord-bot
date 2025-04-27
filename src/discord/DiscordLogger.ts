import {E} from '#src/internal/pure/effect.ts';
import {DiscordREST} from 'dfx/DiscordREST';

export class DiscordLogger extends E.Service<DiscordLogger>()('deepfryer/DiscordLogger', {
  effect: E.gen(function* () {
    const discord = yield* DiscordREST;

    return {
      logError: (e: unknown) => E.void,
    };
  }),
  accessors: true,
}) {}
