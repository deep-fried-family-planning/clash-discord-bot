import {g} from '#pure/effect';
import {type Node, UnsafeHook} from '#src/internal/disreact/entity/index.ts';
import {MutexBroker} from '#src/internal/disreact/lifecycle/layers/mutex-broker.ts';


export const mountNode = (
  node: Node.Node,
) => MutexBroker.fiberSafe(g(function * () {
  UnsafeHook.flushHooks();

  const hooks = node.mount();

  return hooks;
}));
