import {E} from '#pure/effect';
import {NONE} from '#src/internal/disreact/entity/constants.ts';
import {Pipeline, Tx} from '#src/internal/disreact/entity/index.ts';
import {DiscordBroker} from '#src/internal/disreact/lifecycle/layers/discord-broker.ts';
import {NodeManager} from '#src/internal/disreact/lifecycle/layers/node-manager.ts';
import {RouteManager} from '#src/internal/disreact/lifecycle/layers/route-manager.ts';
import {hydrateFromRest} from '#src/internal/disreact/lifecycle/rendering/hydrate.ts';
import {intermediateRender} from '#src/internal/disreact/lifecycle/rendering/intermediate-render.ts';
import {mountNode} from '#src/internal/disreact/lifecycle/rendering/mount-node.ts';
import {simulateMessage} from '#src/internal/disreact/lifecycle/rendering/simulate-event.ts';


export const simulateClick = E.gen(function * () {
  const params = yield * RouteManager.getParams();
  const node   = yield * NodeManager.getNode(params.root_id, params.node_id);

  yield * mountNode(node);
  yield * hydrateFromRest(node);

  const nextParams = yield * simulateMessage(node);

  // detect node change
  if (nextParams.close) {
    yield * DiscordBroker.defer(node.defer);
    yield * DiscordBroker.delete();
    return;
  }

  if (nextParams.node_id === NONE || nextParams.node_id === params.node_id) {
    yield * DiscordBroker.defer(node.defer);

    return;
  }

  if (nextParams.node_id === params.root_id) {
    yield * DiscordBroker.defer(nextParams.defer);
    yield * RouteManager.setParams({
    });

    return;
  }

  if (nextParams.node_id !== params.node_id) {
    const next = yield * NodeManager.getNode(params.root_id, nextParams.node_id);

    yield * DiscordBroker.defer(next.defer);
    yield * RouteManager.setParams({
      node_id: nextParams.node_id,
    });

    yield * mountNode(next);

    const rendered = yield * intermediateRender(next);


    // todo open dialog
    if (next._tag === 'Dialog') {
      yield * DiscordBroker.defer(Tx.OpenDialog);

      // todo save current message
    }

    // todo different node
    else {
      yield * DiscordBroker.defer(Tx.PrivateUpdate);
      next.render();

      return;
    }
  }

  // todo same node
  else {
    // rehydrate

    // rerender

  }
});


export const ClickSimulation = Pipeline.make({
  pipe_id: 'c',
  run    : () => simulateClick,
});
