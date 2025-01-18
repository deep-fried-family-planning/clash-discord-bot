import {E} from '#pure/effect';
import type {Ix} from '#src/internal/disreact/entity/index.ts';
import {DiscordBroker} from '#src/internal/disreact/runtime-old/layers/discord-broker.ts';
import {MemoryStore} from '#src/internal/disreact/runtime-old/layers/memory-store.ts';
import {RouteManager} from '#src/internal/disreact/runtime-old/layers/route-manager.ts';
import {commit} from '#src/internal/disreact/runtime-old/phase/commit.ts';
import {decode} from '#src/internal/disreact/runtime-old/phase/decode.ts';
import {finalize} from '#src/internal/disreact/runtime-old/phase/finalize.ts';


export const interact = E.fn('interact')(
  function * (rest: Ix.Rest) {
    yield * E.logDebug(`[interact]: starting`);

    yield * E.all([
      MemoryStore.allocate(rest),
      RouteManager.allocate(rest),
      DiscordBroker.allocate(rest),
    ]);

    yield * decode();
    yield * commit();
    yield * finalize();
  },
);
