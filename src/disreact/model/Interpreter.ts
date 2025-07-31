import * as Effect from 'effect/Effect';

export class Interpreter extends Effect.Service<Interpreter>()('disreact/Interpreter', {
  effect: Effect.fnUntraced(function* () {
    return {

    };
  }),
  accessors: true,
}) {}
