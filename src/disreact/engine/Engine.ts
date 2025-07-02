import {Codec} from '#disreact/engine/Codec.ts';
import {Rehydrator} from '#disreact/engine/Rehydrator.ts';
import * as E from 'effect/Effect';
import * as Hydrant from '#disreact/core/Hydrant.ts';
import type * as Node from '#disreact/core/Node.ts';

export class Engine extends E.Service<Engine>()('disreact/Engine', {
  effect: E.gen(function* () {
    const codec = yield* Codec;
    const rehydrator = yield* Rehydrator;

    return {
      fabricate : () => {},
      synthesize: () => {},
      simulate  : () => {},
    };
  }),
  accessors: true,
}) {}
