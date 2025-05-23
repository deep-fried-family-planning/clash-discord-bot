import {ClashOfClans} from '#src/service/ClashOfClans.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {EA} from '#src/internal/types.ts';
import * as Cache from 'effect/Cache';
import * as E from 'effect/Effect';
import * as L from 'effect/Layer';

const cache = Cache.make({
  capacity  : 100,
  timeToLive: '1 hour',
  lookup    : (playerTag: str) => E.gen(function* () {
    const player = yield* ClashOfClans.getPlayer(playerTag);

    return player;
  }),
});

const program = E.gen(function* () {
  const clash = yield* cache;

  return {
    getPlayers: (tags: str[]) => E.gen(function* () {
      const inTags = [];
      const outTags = [];
      for (const player of tags) {
        if (yield* clash.contains(player)) {
          const value = yield* clash.get(player);
          inTags.push(value);
        }
        else {
          outTags.push(player);
        }
      }
      const playerData = yield* ClashOfClans.getPlayers(outTags);
      for (const data of playerData) {
        yield* clash.set(data.tag, data);
      }
      return [...inTags, ...playerData];
    }),
  };
});

export class ClashCache extends E.Tag('clashCache')<ClashCache, EA<typeof program>>() {
  static Live = L.effect(this, program);
}
