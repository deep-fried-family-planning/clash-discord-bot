import {JsxExample, SubComponent} from '#src/discord/jsx-example.tsx';
import type {TagFunc} from '#disreact/dsx/types.ts';
import {createRootMap} from '#disreact/model/root-map.ts';
import {ContextManager} from '#disreact/runtime/layer/ContextManager.ts';
import {Broker} from '#disreact/runtime/layer/DisReactBroker.ts';
import {FiberDOM} from '#disreact/runtime/layer/FiberDOM.ts';
import {StaticDOM} from '#disreact/runtime/layer/StaticDOM.ts';
import {synthesize} from '#disreact/runtime/synthesize.ts';
import {E,  L, pipe} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';



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
    synthesize: (root: str | TagFunc) => synthesize(root).pipe(E.provide(requirements)),
  };
};


export const DisReactDOM = createRoot([
  JsxExample,
  SubComponent,
]);
