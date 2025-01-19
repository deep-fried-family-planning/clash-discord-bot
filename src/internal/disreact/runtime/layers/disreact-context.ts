import {E, g, L} from '#pure/effect';
import {Err} from '#src/internal/disreact/entity/index.ts';
import {In} from '#src/internal/disreact/model/entities/index.ts';
import type {EA} from '#src/internal/types.ts';


const context = g(function * () {
  let current = In.None as In.Submit | In.Click;

  return {
    allocate: (next: In.T) => {
      if (In.isNone(next)) throw new Err.Impossible();
      current = next;
    },
    current: () => current,
  };
});


export class DisReactContext extends E.Tag('DisReactContext')<
  DisReactContext,
  EA<typeof context>
>() {
  static makeLayer = () => L.effect(this, context);
}
