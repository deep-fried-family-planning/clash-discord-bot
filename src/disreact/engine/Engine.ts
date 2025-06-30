import {Codec} from '#disreact/engine/Codec.ts';
import * as E from 'effect/Effect';

export class Engine extends E.Service<Engine>()('disreact/Engine', {
  effect: () => E.gen(function* () {
    const codec = yield* Codec;

    return {

    };
  }),
  accessors: true,
}) {}
