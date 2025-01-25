import {getInteractionRoutingInfo} from '#disreact/api/route.ts';
import {findOnClickTargets} from '#disreact/model/events/on-click.ts';
import {decodeHooks} from '#disreact/model/hooks/hook-codec.ts';
import {getSwitch, setSwitch} from '#disreact/model/static-graph/use-switch.ts';
import {accumulateStates, dismountTree} from '#disreact/model/tree/dismount.ts';
import {renderTree} from '#disreact/model/tree/render.ts';
import {ContextManager} from '#disreact/runtime/layer/ContextManager.ts';
import {Broker} from '#disreact/runtime/layer/DisReactBroker.ts';
import {StaticDOM} from '#disreact/runtime/layer/StaticDOM.ts';
import {E} from '#pure/effect';
import type {Ix} from '#src/internal/disreact/virtual/entities/dapi.ts';
import {Err} from '#src/internal/disreact/virtual/kinds/index.ts';
import {Discord} from 'dfx/index';



export const respond = E.fn('DisReact.respond')(function * (
  rest: Ix,
) {
  if (rest.type === Discord.InteractionType.PING) return yield * new Err.Critical();
  if (rest.type === Discord.InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE) return yield * new Err.Critical();
  if (rest.type === Discord.InteractionType.APPLICATION_COMMAND) return yield * new Err.Critical();

  const restToken = yield * Broker.saveToken(rest);
  const info      = getInteractionRoutingInfo(rest);

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


const cloneMount = E.fn('respond.cloneMount')(function * () {


});


const simulateEvent = E.fn('respond.simulateEvent')(function * () {


});


const dismountEffect = E.fn('respond.dismountEffect')(function * () {

});


const mountEffect = E.fn('respond.mountEffect')(function * () {

});
