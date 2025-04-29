import type {CompKey} from '#src/internal/discord-old/dynamo/dynamo.ts';
import {discordEmbedRead} from '#src/internal/discord-old/dynamo/operations/embed.ts';
import type {DEmbed} from '#src/internal/discord-old/dynamo/schema/discord-embed.ts';
import {C, E, L} from '#src/internal/pure/effect.ts';
import type {EA} from '#src/internal/types.ts';

const embeds = C.make({
  capacity  : 100,
  timeToLive: '10 minutes',
  lookup    : (embedId: CompKey<DEmbed>['pk']) => discordEmbedRead(embedId),
});

const program = E.gen(function* () {
  const embed = yield* embeds;

  return {
    embedRead      : (...p: Parameters<typeof embed.get>) => embed.get(...p),
    embedSet       : (...p: Parameters<typeof embed.set>) => embed.set(...p),
    embedInvalidate: (...p: Parameters<typeof embed.invalidate>) => embed.invalidate(...p),
  };
});

export class MenuCache extends E.Tag('MenuCache')<
  MenuCache,
  EA<typeof program>
>() {
  static Live = L.effect(this, program);
}
