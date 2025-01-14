import {E, g} from '#pure/effect';
import type { Node} from '#src/internal/disreact/entity/index.ts';
import {Auth, Failure, Hook, UnsafeCall, UnsafeHook, VDocument, VEvent} from '#src/internal/disreact/entity/index.ts';
import {MemoryStore} from '#src/internal/disreact/main/layers/memory-store.ts';
import {MutexBroker} from '#src/internal/disreact/main/layers/mutex-broker.ts';
import {RouteManager} from '#src/internal/disreact/main/layers/route-manager.ts';


export const mount = (
  node: Node.Node,
) => g(function * () {
  yield * MutexBroker.acquire();

  UnsafeHook.flushHooks();
  const hooks = node.mount();

  yield * MutexBroker.release();
  return hooks;
});


export const hydrateFromRest = (
  node: Node.Node,
) => g(function * () {
  yield * MutexBroker.acquire();

  const hooks        = node.mount();
  const search       = yield * RouteManager.getSearch();
  const updatedHooks = Hook.decodeHydrate(search, hooks);

  updatedHooks.forEach(UnsafeHook.hydrateHook);

  const rendered = yield * render(node);

  yield * MutexBroker.release();
  return rendered;
});


export const simulateMessage = (
  node: Node.Node,
) => g(function * () {
  yield * MutexBroker.acquire();

  if (node._tag !== 'Message') {
    yield * MutexBroker.release();
    return yield * new Failure.Critical({why: 'Node should not return a message'});
  }

  let event = yield * MemoryStore.nextEvent();

  if (!event || !VEvent.isNone(event)) {
    yield * MutexBroker.release();
    return yield * new Failure.Critical({why: 'No event found'});
  }

  let curr = yield * hydrate(node);

  do {
    if (!event) {
      yield * E.logDebug('Events exhausted');
      break;
    }
    if (!VEvent.isClicked(event)) {
      yield * MemoryStore.unshiftEvent(event);
      break;
    }
    curr  = yield * hydrate(node);
    event = yield * MemoryStore.nextEvent();
  }
  while (!event);

  const next = UnsafeCall.flushNext();

  yield * MutexBroker.release();
  return next;
});


export const render = (
  node: Node.Node,
) => g(function * () {
  const rendered = node.render();

  if (node.needsAuth) {
    const auths = yield * MemoryStore.getAuths();

    rendered.components = rendered.components.map((row) => row.filter((component) => {
      if (!component.auths?.length) return true;
      return Auth.hasAllAuths(auths, component.auths);
    }));
  }

  return yield * MemoryStore.update(VDocument.attachElement(rendered));
});


const hydrate = (
  node: Node.Node,
) => g(function * () {
  const calls = UnsafeCall.flushCalls();

  let idx = 0;
  for (const call of calls) {
    idx++;
    yield * E.logDebug(`[call ${idx}]`, call);
  }

  const rendered = yield * render(node);

  return rendered;
});
