import {E, g} from '#pure/effect';
import {Failure, type Node, UnsafeCall, VEvent} from '#src/internal/disreact/entity/index.ts';
import {MemoryStore} from '#src/internal/disreact/lifecycle/layers/memory-store.ts';
import {MutexBroker} from '#src/internal/disreact/lifecycle/layers/mutex-broker.ts';
import {hydrate} from '#src/internal/disreact/lifecycle/rendering/hydrate.ts';


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

  do {
    if (!event) {
      yield * E.logDebug('Events exhausted');
      break;
    }
    if (!VEvent.isClicked(event)) {
      yield * MemoryStore.unshiftEvent(event);
      break;
    }
    yield * hydrate(node);
    event = yield * MemoryStore.nextEvent();
  }
  while (!event);

  const next = UnsafeCall.flushNext();

  yield * MutexBroker.release();

  return next;
});
