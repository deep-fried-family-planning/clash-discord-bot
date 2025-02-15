import {E, L} from '#src/internal/pure/effect.ts';



const make = E.gen(function * () {
  return {

  };
});



export class Lifecycles extends E.Tag('DisReact.Lifecycles')<
  Lifecycles,
  E.Effect.Success<typeof make>
>() {
  static readonly singleton = L.effect(this, make);
}
