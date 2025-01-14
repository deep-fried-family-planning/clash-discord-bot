import {g, Kv, pipe} from '#pure/effect';
import type {Node} from '#src/internal/disreact/entity/index.ts';
import {NodeManager} from '#src/internal/disreact/lifecycle/layers/node-manager.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export const synthesize = (
  root: str | {[k: str]: Node.Fn},
) => g(function * () {
  const root_id = typeof root === 'string' ? root : pipe(root, Kv.keys)[0];
  const node    = yield * NodeManager.getNode(root_id, root_id);

  return node.render();
});
