import {Err, Ix, type Rest} from '#src/disreact/api/index.ts';
import {getInteractionRoutingInfo} from '#src/disreact/api/route.ts';
import {findOnClickTargets} from '#src/disreact/model/events/on-click.ts';
import {decodeHooks} from '#src/disreact/model/hooks/hook-codec.ts';
import {getSwitch, setSwitch} from '#src/disreact/model/static-graph/use-switch.ts';
import {accumulateStates, dismountTree} from '#src/disreact/model/tree/dismount.ts';
import {renderTree} from '#src/disreact/model/tree/render.ts';
import {ContextManager} from '#src/disreact/runtime/layer/ContextManager.ts';
import {Broker} from '#src/disreact/runtime/layer/DisReactBroker.ts';
import {StaticDOM} from '#src/disreact/runtime/layer/StaticDOM.ts';
import {E} from '#src/internal/pure/effect.ts';



export const respond = E.fn('DisReact.respond')(function * (
  rest: Rest.Interaction,
) {
  const restToken   = yield * Broker.saveToken(rest);
  const info        = getInteractionRoutingInfo(rest);
  const interaction = yield * Ix.decodeInteraction(rest);

  yield * ContextManager.reallocate();
  yield * ContextManager.setKey('rest', rest);
  yield * ContextManager.setKey('restToken', restToken);
  yield * ContextManager.setKey('info', info);

  setSwitch(info.node);

  const restHooks    = decodeHooks(info.search);
  const initialTree  = yield * StaticDOM.cloneNode(info.node, info.root);
  const hydratedTree = renderTree(initialTree, restHooks);

  const eventTargets = findOnClickTargets(rest, hydratedTree);

  if (!eventTargets.rest.value) return yield * new Err.Critical();
  if (!eventTargets.clone) return yield * new Err.Critical();
  if (!eventTargets.rest.value.type) return yield * new Err.Critical();

  eventTargets.clone.handleEvent({
    type: 'onClick',
    rest: eventTargets.rest.value,
  });

  const switchValue  = getSwitch();
  const shouldSwitch = info.node !== switchValue;

  if (shouldSwitch) {
    dismountTree(hydratedTree);

    const switchedTree = yield * StaticDOM.cloneNode(switchValue, info.root);
    const renderedTree = renderTree(switchedTree);
  }

  const eventHooks   = accumulateStates(hydratedTree);
  const updateTree   = renderTree(hydratedTree, eventHooks);
  const updatedHooks = accumulateStates(updateTree);

  // todo process useEffect
});
