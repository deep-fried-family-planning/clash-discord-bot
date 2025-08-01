import * as Effect from 'effect/Effect';

export class Rehydrator extends Effect.Service<Rehydrator>()('disreact/Rehydrator', {
  effect: Effect.fnUntraced(function* () {
    return {

    };
  }),
  accessors: true,
}) {}
