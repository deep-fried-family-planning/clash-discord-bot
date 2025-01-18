import {E, Kv, pipe} from '#pure/effect';
import {COL_NONE, NONE, ROW_NONE} from '#src/internal/disreact/entity/constants.ts';
import {Hook, type Node, Route, Tx, VMessage} from '#src/internal/disreact/entity/index.ts';
import {NodeManager} from '#src/internal/disreact/runtime-old/layers/node-manager.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export const synthesize = E.fn(':synthesize')(
  function * (root: str | {[k: str]: Node.Fn}) {
    const root_id = typeof root === 'string' ? root : pipe(root, Kv.keys)[0];
    const node    = yield * NodeManager.getNode(root_id, NONE);
    const hooks   = node.mount();
    const output  = node.render();
    const search  = Hook.encodeToSearch(hooks);

    yield * E.logTrace(root);
    yield * E.logTrace(search);

    return pipe(
      output,
      VMessage.identity,
      VMessage.encodeForRestOrMemory(pipe(
        Route.Simulated.empty(),
        Route.setRoot(root_id),
        Route.setNode(NONE),
        Route.setPipe('b'),
        Route.setPrevious(NONE),
        Route.setRow(ROW_NONE),
        Route.setCol(COL_NONE),
        Route.setMod(NONE),
        Route.setDefer(Tx.encode(output.defer)),
        Route.setSearch(search),
      )),
    );
  },
  E.withLogSpan('exec_ms'),
);
