import type {Rest} from '#src/disreact/api/index.ts';
import type {TagFunc} from '#src/disreact/model/dsx/types.ts';
import {ContextManager} from '#src/disreact/runtime/layer/ContextManager.ts';
import {Broker} from '#src/disreact/runtime/layer/DisReactBroker.ts';
import {FiberDOM} from '#src/disreact/runtime/layer/FiberDOM.ts';
import {StaticDOM} from '#src/disreact/runtime/layer/StaticDOM.ts';
import {respond} from '#src/disreact/respond.ts';
import {synthesize} from '#src/disreact/synthesize.ts';
import {E, L, pipe} from '#src/internal/pure/effect.ts';



export const createDisReact = (
  types: TagFunc[],
) => {
  const broker = Broker.singleton('');
  const staticDom = StaticDOM.makeLayer(types);

  return {
    synthesize: (root: string | TagFunc) => synthesize(root).pipe(
      E.provide(pipe(
        L.empty,
        L.provideMerge(broker),
        L.provideMerge(staticDom),
      )),
    ),

    respond: (rest: Rest.Interaction) => respond(rest).pipe(
      E.provide(pipe(
        L.empty,
        L.provideMerge(ContextManager.makeLayer()),
        L.provideMerge(FiberDOM.makeLayer()),
        L.provideMerge(broker),
        L.provideMerge(staticDom),
      )),
    ),
  };
};
