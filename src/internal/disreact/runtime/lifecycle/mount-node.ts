import {E, g} from '#pure/effect';
import {type Node, UnsafeHook} from '#src/internal/disreact/entity/index.ts';
import {annotateLifeCycle} from '#src/internal/disreact/runtime/helpers.ts';
import {MutexBroker} from '#src/internal/disreact/runtime/layers/mutex-broker.ts';


const annotations = annotateLifeCycle('mountNode');


export const mountNode = (node: Node.Node) => MutexBroker.fiberSafe(g(function * () {
  yield * E.logTrace(`[mountNode]`);

  UnsafeHook.flushHooks();

  const hooks = node.mount();

  return hooks;
})).pipe(
);
