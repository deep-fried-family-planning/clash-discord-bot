import {Encoder} from '#disreact/model/Encoder.ts';
import {Rehydrator} from '#disreact/model/Rehydrator.ts';
import * as E from 'effect/Effect';
import * as Hydrant from '#disreact/core/Hydrant.ts';
import type * as Node from '#disreact/core/Node.ts';

export class Model extends E.Service<Model>()('disreact/Model', {
  effect: E.gen(function* () {
    const codec = yield* Encoder;
    const rehydrator = yield* Rehydrator;

    return {
      fabricate : () => {},
      synthesize: () => {},
      simulate  : () => {},
    };
  }),
  accessors: true,
}) {}
