import {E, L} from '#src/internal/pure/effect.ts';



const make = E.gen(function * () {
  return {

  };
});



export class Renderer extends E.Tag('DisReact.Renderer')<
  Renderer,
  E.Effect.Success<typeof make>
>() {
  static readonly singleton = L.effect(this, make);
}
