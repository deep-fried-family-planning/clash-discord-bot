import type {TagFunc} from '#src/disreact/dsx/types.ts';
import {ContextManager} from '#src/disreact/runtime/layer/ContextManager.ts';
import {Broker} from '#src/disreact/runtime/layer/DisReactBroker.ts';
import {FiberDOM} from '#src/disreact/runtime/layer/FiberDOM.ts';
import {StaticDOM} from '#src/disreact/runtime/layer/StaticDOM.ts';
import {synthesize} from '#src/disreact/runtime/synthesize.ts';
import {E, L, pipe} from '#src/internal/pure/effect.ts';



export const createRoot = (
  types: TagFunc[],
) => {
  const requirements = pipe(
    L.empty,
    L.provideMerge(ContextManager.makeLayer()),
    L.provideMerge(FiberDOM.makeLayer()),
    L.provideMerge(StaticDOM.makeLayer(types)),
    L.provideMerge(Broker.singleton('')),
  );

  return {
    synthesize: (root: string | TagFunc) => synthesize(root).pipe(E.provide(requirements)),
  };
};


export const DisReactDOM = createRoot([
  JsxExample,
  SubComponent,
]);
