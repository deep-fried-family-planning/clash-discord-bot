import {type DPlayer, scanDiscordPlayers} from '#src/internal/discord-old/dynamo/schema/discord-player.ts';
import {CSL, E, L, pipe} from '#src/internal/pure/effect.ts';
import {reduceL} from '#src/internal/pure/pure-list.ts';
import type {EA} from '#src/internal/types.ts';

const cache = E.gen(function* () {
  yield* CSL.log('player cache');
  const players = yield* scanDiscordPlayers();

  const all = pipe(
    players,
    reduceL({} as Record<string, DPlayer>, (acc, a) => {
      acc[a.sk] = a;

      return acc;
    }),
  );

  return {
    all: () => E.succeed(all),
  };
});

export class PlayerCache extends E.Tag('DeepFryerPlayerCache')<
  PlayerCache,
  EA<typeof cache>
>() {
  static Live = L.effect(this, cache);
}
