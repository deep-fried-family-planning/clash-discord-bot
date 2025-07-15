import {ModelCodec} from '#disreact/model/ModelCodec.ts';
import {Rehydrator} from '#disreact/model/Rehydrator.ts';
import * as E from 'effect/Effect';
import * as Hydrant from '#disreact/core/Hydrant.ts';
import type * as Node from '#disreact/core/Element.ts';
import type * as Document from '#disreact/core/Document.ts';
import * as Lifecycle from '#disreact/model/Lifecycle.ts';

export interface ModelService {
  dehydrate: (document: Document.Document) => E.Effect<>;
}


export class Model extends E.Service<Model>()('disreact/Model', {
  effect: E.gen(function* () {
    const codec = yield* ModelCodec;

    return {
      fabricateFC: () => {},
      fabricate  : () => {},
      synthesize : () => {},
      simulate   : () => {},
    };
  }),
  accessors: true,
}) {}
