import {E} from '#pure/effect';
import {NONE} from '#src/internal/disreact/entity/constants.ts';
import {LifeCycle, Pipeline, UnsafeCall} from '#src/internal/disreact/entity/index.ts';
import {Tx} from '#src/internal/disreact/entity/types/index.ts';
import {DiscordBroker} from '#src/internal/disreact/main/layers/discord-broker.ts';
import {NodeManager} from '#src/internal/disreact/main/layers/node-manager.ts';
import {RouteManager} from '#src/internal/disreact/main/layers/route-manager.ts';


const simulateClick = E.gen(function * () {
  const params = yield * RouteManager.getParams();
  const node   = yield * NodeManager.getNode(params.root_id, params.node_id);

  yield * LifeCycle.mount(node);
  yield * LifeCycle.hydrateFromRest(node);

  const nextParams = yield * LifeCycle.simulateMessage(node);

  // detect node change
  if (nextParams.close) {
    yield * DiscordBroker.defer(node.defer);
    yield * DiscordBroker.delete();
    return;
  }
  if (nextParams.node_id === NONE) {
    yield * DiscordBroker.defer(Tx.Private);
    return;
  }
  if (nextParams.node_id === params.root_id) {
    yield * DiscordBroker.defer(nextParams.defer);
    return;
  }
  if (nextParams.node_id !== params.node_id) {
    const next = yield * NodeManager.getNode(params.root_id, nextParams.node_id);
    yield * DiscordBroker.defer(next.defer);
    yield * LifeCycle.mount(next);
    const rendered = yield * LifeCycle.render(next);


    // todo open dialog
    if (next._tag === 'Dialog') {
      yield * DiscordBroker.defer(Tx.OpenDialog);

      // todo save current message
    }
    // todo different node
    else {
      yield * DiscordBroker.defer(Tx.PrivateUpdate);
      next.render();
    }
  }
  // todo same node
  else {
    // rehydrate

    // rerender

  }

  // rehydrate
  const hookCalls = UnsafeCall.flushCalls();
});


export const ClickSimulation = Pipeline.make({
  pipe_id: 'c',
  run    : () => simulateClick,
});
