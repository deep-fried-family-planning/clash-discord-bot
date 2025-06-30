import * as E from 'effect/Effect';

export class Engine extends E.Service<Engine>()('disreact/Enginer', {
  effect: () => E.gen(function* () {
    return {
      
    };
  }),
  accessors: true,
}) {}
