import {E, flow, L, pipe} from '#pure/effect';
import {interact} from '#src/internal/disreact/interact.ts';
import {DisReactMemory} from '#src/internal/disreact/runtime/layers/disreact-memory.ts';
import {synthesize} from '#src/internal/disreact/synthesize.ts';
import type {Nd} from '#src/internal/disreact/virtual/entities/index.ts';
import type {EAR} from '#src/internal/types.ts';


export const createDisReact = E.fn('DisReact:createDisReact')(
  function * (roots: Nd.KeyedFns) {
    const singletons = pipe(
      L.empty,
      L.provideMerge(DisReactMemory.makeLayer(roots)),
    );

    return {
      interact: flow(
        interact,
        E.provide(singletons),
        E.tap(E.logTrace('DisReact.interact: complete')),
        E.withLogSpan('interact_ms'),
        E.awaitAllChildren,
      ),
      synthesize: flow(
        synthesize,
        E.provide(singletons),
      ),
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
