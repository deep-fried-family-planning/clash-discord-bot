import {E, g} from '#pure/effect';
import type {Node} from '#src/internal/disreact/entity/index.ts';
import {Hook, UnsafeCall, UnsafeHook} from '#src/internal/disreact/entity/index.ts';
import {MutexBroker} from '#src/internal/disreact/lifecycle/layers/mutex-broker.ts';
import {RouteManager} from '#src/internal/disreact/lifecycle/layers/route-manager.ts';
import {intermediateRender} from '#src/internal/disreact/lifecycle/rendering/intermediate-render.ts';


export const hydrateFromRest = (
  node: Node.Node,
) => g(function * () {
  yield * MutexBroker.acquire();

  const hooks        = node.mount();
  const search       = yield * RouteManager.getSearch();
  const updatedHooks = Hook.decodeHydrate(search, hooks);

  updatedHooks.forEach(UnsafeHook.hydrateHook);

  const rendered = yield * intermediateRender(node);

  yield * MutexBroker.release();

  return rendered;
});


export const hydrate = (
  node: Node.Node,
) => g(function * () {
  const calls = UnsafeCall.flushCalls();

  let idx = 0;
  for (const call of calls) {
    idx++;
    yield * E.logDebug(`[call ${idx}]`, call);
  }

  const rendered = yield * intermediateRender(node);

  return rendered;
});
