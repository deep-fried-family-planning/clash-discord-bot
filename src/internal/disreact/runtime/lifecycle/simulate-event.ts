import {E} from '#pure/effect';
import {Cd, Failure, type Node, UnsafeCall, VEvent} from '#src/internal/disreact/entity/index.ts';
import {annotateLifeCycle} from '#src/internal/disreact/runtime/helpers.ts';
import {MemoryStore} from '#src/internal/disreact/runtime/layers/memory-store.ts';
import {MutexBroker} from '#src/internal/disreact/runtime/layers/mutex-broker.ts';
import {hydrate} from '#src/internal/disreact/runtime/lifecycle/hydrate.ts';


const annotations = annotateLifeCycle('simulateMessage');


export const simulateMessage = E.fn('simulateMessage')(
  function * (node: Node.Node) {
    yield * E.logTrace(`[simulateMessage]`);

    if (node._tag !== 'Message') return yield * new Failure.Critical({why: 'Node should not return a message'});

    let event    = yield * MemoryStore.nextEvent(),
        document = yield * hydrate(node);


    if (!event || VEvent.isNone(event)) return yield * new Failure.Critical({why: 'No event found'});

    const rest = yield * MemoryStore.getRest();

    do {
      yield * E.logTrace(`${event?._tag}`, event);

      if (!event) {
        break;
      }
      if (!VEvent.isClicked(event)) {
        yield * MemoryStore.unshiftEvent(event);
        break;
      }

      const target      = document.message.components.at(event.row)?.at(event.col);
      const target_rest = rest.message.components.at(event.row)?.at(event.col);

      if (!target) return yield * new Failure.Critical({why: 'No onClick target found'});
      if (!target.onClick) return yield * new Failure.Critical({why: 'No onClick handler found'});
      if (!target_rest) return yield * new Failure.Critical({why: 'No target REST data found'});

      target.onClick({
        target: document,
        values: Cd.getSelectedValues,
      });
      document = yield * hydrate(node);
      event    = yield * MemoryStore.nextEvent();
    }
    while (!event);

    const next = UnsafeCall.flushNext();
    yield * E.logTrace(`next: ${next.node_id} ${next.defer._tag} ${next.close}`);

    return next;
  },
  MutexBroker.fiberSafe,
);
