import {E, Kv, pipe} from '#pure/effect';
import {Err} from '#src/internal/disreact/entity/index.ts';
import {Co, Df, type Nd} from '#src/internal/disreact/model/entities/index.ts';
import {MainRoute} from '#src/internal/disreact/model/route/index.ts';
import {DisReactMemory} from '#src/internal/disreact/runtime/layers/disreact-memory.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {inspect} from 'node:util';


export const synthesize = E.fn('DisReact.synthesize')(
  function * (root: str | {[k: str]: Nd.Fn}) {
    const root_name = typeof root === 'string' ? root : pipe(root, Kv.keys)[0];
    const node      = yield * DisReactMemory.getNode(root_name, root_name);
    const mounted   = node.mount();

    if (mounted._tag === 'Dialog') {
      return yield * new Err.NotImplemented();
    }

    const output = pipe(
      mounted,
      Co.encodeMessage(pipe(
        MainRoute.empty(),
        MainRoute.setRoot(root_name),
        MainRoute.setNode(root_name),
        MainRoute.setDefer(Df.encodeDefer(node.onMountDefer)),
        MainRoute.setSearch(new URLSearchParams()),
      )),
    );

    yield * E.logWarning('synthesize', inspect(output, false, null, true));

    return output;
  },
  E.withLogSpan('synthesize_ms'),
  E.awaitAllChildren,
  E.tap(E.logTrace('DisReact.synthesize: complete')),
);
