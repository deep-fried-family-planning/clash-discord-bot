import {E, pipe} from '#pure/effect';
import {NONE} from '#src/internal/disreact/entity/constants.ts';
import {Tx} from '#src/internal/disreact/entity/index.ts';
import {DiscordBroker} from '#src/internal/disreact/runtime/layers/discord-broker.ts';
import {MemoryStore} from '#src/internal/disreact/runtime/layers/memory-store.ts';
import {NodeManager} from '#src/internal/disreact/runtime/layers/node-manager.ts';
import {RouteManager} from '#src/internal/disreact/runtime/layers/route-manager.ts';
import {hydrateFromRest} from '#src/internal/disreact/runtime/lifecycle/hydrate.ts';
import {intermediateRender} from '#src/internal/disreact/runtime/lifecycle/intermediate-render.ts';
import {mountNode} from '#src/internal/disreact/runtime/lifecycle/mount-node.ts';
import {simulateMessage} from '#src/internal/disreact/runtime/lifecycle/simulate-event.ts';
import {Fiber} from 'effect';


const resolveDefer = (prev: Tx.Defer, next: Tx.Defer) => {
  if (Tx.isPublic(prev) && Tx.isPublic(next)) {
    return Tx.PublicUpdate;
  }
  else if (Tx.isPrivate(prev) && Tx.isPrivate(next)) {
    return Tx.PrivateUpdate;
  }
  else if (Tx.isPublic(prev) && Tx.isPrivate(next)) {
    return Tx.Private;
  }
  return Tx.PrivateUpdate;
};


const resolveSame = (defer: Tx.Defer) => {
  if (Tx.isPublic(defer)) {
    return Tx.PublicUpdate;
  }
  else if (Tx.isPrivate(defer)) {
    return Tx.Private;
  }
  return defer;
};


export const simulateClick = E.fn(':simulateClick')(
  function * () {
    const params = yield * RouteManager.getParams();
    const node   = yield * NodeManager.getNode(params.root_id, params.node_id);

    yield * mountNode(node);
    yield * hydrateFromRest(node);

    const nextParams = yield * simulateMessage(node);

    // detect node change
    if (nextParams.close) {
      yield * E.logTrace(`closing ${node.root_id} ${node.node_id}`);
      // const ix = yield * pipe(MemoryStore.getIx(params.prev_id), E.flatMap((ret) => ret.await)); if (ix._tag === 'Success' && ix.value.Item) { return yield * DiscordBroker.delete(ix.value.Item.token); } else { // yield * DiscordBroker.defer(Tx.PrivateUpdate); }
      const token = yield * MemoryStore.getIx(params.prev_id);

      if (!token) {
        yield * E.logTrace(`deleting the hard way...`);
        yield * pipe(DiscordBroker.defer(Tx.PrivateUpdate), E.flatMap((ret) => {
          return Fiber.await(ret);

          return Fiber.match({
            onFiber       : (fiber) => Fiber.await(fiber),
            onRuntimeFiber: (fiber) => Fiber.await(fiber),
          })(ret);
        }));
        return yield * DiscordBroker.delete();
      }
      else {
        yield * E.logTrace(`deleting the easy way...`);
        return yield * DiscordBroker.delete(token);
      }
    }

    if (nextParams.node_id === params.node_id || nextParams.node_id === NONE) {
      yield * E.logDebug(`same node ${node.root_id} ${node.node_id}`);
      yield * DiscordBroker.defer(resolveSame(node.defer));
      yield * RouteManager.setParams({
        node_id: node.node_id,
      });

      return;
    }

    if (nextParams.node_id !== params.node_id) {
      const next = yield * NodeManager.getNode(params.root_id, nextParams.node_id);
      yield * E.logDebug(`new node ${params.root_id} ${nextParams.node_id}`);

      const prev_defer = node.defer;
      const next_defer = next.defer;
      yield * E.logDebug(`defers ${prev_defer._tag} ${next_defer._tag}`);
      const defer = resolveDefer(prev_defer, next_defer);
      yield * DiscordBroker.defer(defer);

      yield * RouteManager.setParams({
        node_id: next.node_id,
      });

      yield * mountNode(next);

      const rendered = yield * intermediateRender(next);


      // todo open dialog
      if (next._tag === 'Dialog') {

        // todo save current message
      }

      // todo different node
      else {
        next.render();

        return;
      }
    }

    // todo same node
    else {
      // rehydrate

      // rerender
    }
  },
);
