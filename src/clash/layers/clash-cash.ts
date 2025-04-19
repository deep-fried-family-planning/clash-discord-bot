import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {E, L} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {EA} from '#src/internal/types.ts';
import {Cache} from 'effect';



const cache = Cache.make({
  capacity  : 100,
  timeToLive: '1 hour',
  lookup    : (playerTag: str) => E.gen(function* () {
    const player = yield * ClashOfClans.getPlayer(playerTag);

    return player;
  }),
});

const program = E.gen(function* () {
  const clash = yield * cache;

  return {
    getPlayers: (tags: str[]) => E.gen(function* () {
      const inTags  = [];
      const outTags = [];
      for (const player of tags) {
        if (yield * clash.contains(player)) {
          const value = yield * clash.get(player);
          inTags.push(value);
        }
        else {
          outTags.push(player);
        }
      }
      const playerData = yield * ClashOfClans.getPlayers(outTags);
      for (const data of playerData) {
        yield * clash.set(data.tag, data);
      }
      return [...inTags, ...playerData];
    }),
  };
});

export class ClashCache extends E.Tag('clashCache')<ClashCache, EA<typeof program>>() {
  static Live = L.effect(this, program);
}
