import {Codec} from '#disreact/engine/Codec.ts';
import * as Effect from 'effect/Effect';

const engine = Effect.gen(function* () {
  const codec = yield* Codec;

  const hydrateElement = (element: any) => {};
});
