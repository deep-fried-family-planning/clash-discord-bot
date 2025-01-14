import {g} from '#pure/effect';
import type {Ix} from '#src/internal/disreact/entity/index.ts';
import {DiscordBroker} from '#src/internal/disreact/lifecycle/layers/discord-broker.ts';
import {MemoryStore} from '#src/internal/disreact/lifecycle/layers/memory-store.ts';
import {RouteManager} from '#src/internal/disreact/lifecycle/layers/route-manager.ts';
import {commit} from '#src/internal/disreact/lifecycle/phase/commit.ts';
import {decode} from '#src/internal/disreact/lifecycle/phase/decode.ts';
import {finalize} from '#src/internal/disreact/lifecycle/phase/finalize.ts';


export const interact = (rest: Ix.Rest) => g(function * () {
  yield * MemoryStore.allocate(rest);
  yield * RouteManager.allocate(rest);
  yield * DiscordBroker.allocate(rest);
  yield * decode;
  yield * commit;
  yield * finalize;
});
