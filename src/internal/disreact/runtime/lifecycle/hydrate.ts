import {E, g} from '#pure/effect';
import type {Node} from '#src/internal/disreact/entity/index.ts';
import {Hook, UnsafeCall, UnsafeHook} from '#src/internal/disreact/entity/index.ts';
import {annotateLifeCycle} from '#src/internal/disreact/runtime/helpers.ts';
import {MutexBroker} from '#src/internal/disreact/runtime/layers/mutex-broker.ts';
import {RouteManager} from '#src/internal/disreact/runtime/layers/route-manager.ts';
import {intermediateRender} from '#src/internal/disreact/runtime/lifecycle/intermediate-render.ts';


const annotations = annotateLifeCycle('hydrateFromRest');


export const hydrateFromRest = (node: Node.Node) => MutexBroker.fiberSafe(g(function * () {
  yield * E.logTrace(`[hydrateFromRest]`);

  const hooks        = node.mount();
  const search       = yield * RouteManager.getSearch();
  const updatedHooks = Hook.decodeHydrate(search, hooks);

  updatedHooks.forEach(UnsafeHook.hydrateHook);

  const rendered = yield * intermediateRender(node);

  yield * E.logTrace(...hooks);
  yield * E.logTrace(...updatedHooks);

  return rendered;
}));


const hydrateAnnotations = annotateLifeCycle('hydrate');


export const hydrate = (node: Node.Node) => g(function * () {
  yield * E.logTrace(`[hydrate]`);

  const calls = UnsafeCall.flushCalls();

  yield * E.logTrace(...calls);

  let idx = 0;
  for (const call of calls) {
    idx++;
    yield * E.logTrace(call);
  }

  const rendered = yield * intermediateRender(node);

  return rendered;
});
