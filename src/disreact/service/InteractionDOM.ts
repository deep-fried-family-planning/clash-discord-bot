import {E} from '#src/internal/pure/effect.ts';



const make = E.gen(function * () {
  return {

  };
});


export class InteractionDOM extends E.Tag('DisReact.InteractionDOM')<
  InteractionDOM,
  never,
>() {}
