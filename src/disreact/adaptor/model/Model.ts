import {DocumentCodec} from '#disreact/adaptor/model/DocumentCodec.ts';
import * as Node from '#disreact/core/behaviors/exp/nodev1.ts';
import * as Stack from '#disreact/core/behaviors/exp/Stack.ts';
import {Rehydrator} from '#disreact/adaptor/Rehydrator.ts';
import * as Cause from 'effect/Cause';
import {pipe} from 'effect/Function';
import * as E from 'effect/Effect';
import * as Data from 'effect/Data';

export class Model extends E.Service<Model>()('disreact/Model', {
  effect: E.gen(function* () {
    const codec = yield* DocumentCodec;
    const rehydrator = yield* Rehydrator;

    return {

    };
  }),
}) {}
