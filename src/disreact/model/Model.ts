import {DocumentCodec} from '#src/disreact/model/DocumentCodec.ts';
import * as Node from '#src/disreact/model/internal/domain/node.ts';
import * as Stack from '#src/disreact/model/internal/stack.ts';
import {Rehydrator} from '#src/disreact/model/Rehydrator.ts';
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
