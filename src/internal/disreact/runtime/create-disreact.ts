import {E, flow, L, pipe} from '#pure/effect';
import type {Nd} from '#src/internal/disreact/model/entities/index.ts';
import {interact} from '#src/internal/disreact/runtime/interact.ts';
import {DisReactMemory} from '#src/internal/disreact/runtime/layers/disreact-memory.ts';
import {synthesize} from '#src/internal/disreact/runtime/synthesize.ts';
import type {EAR} from '#src/internal/types.ts';


export const createDisReact = E.fn('DisReact:createDisReact')(
  function * (roots: Nd.KeyedFns) {
    const requirements = pipe(
      L.empty,
      L.provideMerge(DisReactMemory.makeLayer(roots)),
    );

    return {
      interact: flow(
        interact,
        E.provide(requirements),
        E.awaitAllChildren,
        E.tap(E.logTrace('DisReact.interact: complete')),
        E.withLogSpan('interact_ms'),
      ),
      synthesize: flow(synthesize, E.provide(requirements)),
    };
  },
  // E.awaitAllChildren,
  E.withLogSpan('createDisReact_ms'),
);


export class DisReact extends E.Tag('DisReact')<
  DisReact,
  EAR<typeof createDisReact>
>() {
  static makeLayer = (roots: Nd.KeyedFns) => L.effect(this, createDisReact(roots));
}
