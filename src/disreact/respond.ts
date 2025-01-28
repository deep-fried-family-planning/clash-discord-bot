/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {Rest} from '#src/disreact/api/index.ts';
import {CriticalFailure} from '#src/disreact/enum/errors.ts';
import {renderTree} from '#src/disreact/model/lifecycles.ts';
import {findNode} from '#src/disreact/model/traversal.ts';
import {ContextManager} from '#src/disreact/runtime/layer/ContextManager.ts';
import {StaticDOM} from '#src/disreact/runtime/layer/StaticDOM.ts';
import {E} from '#src/internal/pure/effect.ts';



export const respond = E.fn('DisReact.respond')(function * (rest: Rest.Interaction) {
  switch (rest.type) {
    case Rest.InteractionType.MODAL_SUBMIT:
    case Rest.InteractionType.PING:
    case Rest.InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE:
    case Rest.InteractionType.APPLICATION_COMMAND:
      return yield * new CriticalFailure();
  }

  if (!rest.message?.components.length) return yield * new CriticalFailure();

  const {
          route,
          states,
          event,
        } = yield * ContextManager.allocate(rest);

  const cloned   = yield * StaticDOM.cloneNode(route.root, route.node);
  const hydrated = renderTree(cloned, states);

  /**
   * event simulation
   */
  const treeTarget = findNode(hydrated, (node) => {
    return node.props.custom_id === rest.data.custom_id;
  });
  if (!treeTarget) return yield * new CriticalFailure();

  treeTarget.handleEvent(event);

  const rerendered = renderTree(cloned);
});
