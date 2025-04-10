import {Codec} from '#src/disreact/codec/Codec.ts';
import {DokenMemory} from '#src/disreact/codec/DokenMemory.ts';
import {Dispatcher} from '#src/disreact/model/Dispatcher.ts';
import type {Elem} from '#src/disreact/model/entity/elem.ts';
import type {FC} from '#src/disreact/model/entity/fc.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {Registry} from '#src/disreact/model/Registry.ts';
import {DisReactConfig} from '#src/disreact/runtime/DisReactConfig.ts';
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts';
import {makeRuntime} from '#src/disreact/runtime/runtime.ts';
import {E, L, pipe} from '#src/internal/pure/effect.ts';
import {it,  vi} from '@effect/vitest';
import {Logger, Redacted, TestServices} from 'effect';

const makeStub = () =>
  vi.fn(() =>
    pipe(
      E.void,
      E.delay(Math.random() * 1000),
    ),
  );

export const makeTestRuntime = (...src: (Elem | FC)[]) => {
  const config = DisReactConfig.configLayer({
      token  : Redacted.make(''),
      sources: src,
    });

  const dom = {
    discard     : makeStub(),
    dismount    : makeStub(),
    deferEdit   : makeStub(),
    createModal : makeStub(),
    createSource: makeStub(),
    createUpdate: makeStub(),
    deferSource : makeStub(),
    deferUpdate : makeStub(),
  } as const;

  const layer = pipe(
    L.mergeAll(
      // L.effectContext(E.succeed(TestServices.liveServices)),
      L.succeed(DisReactDOM, DisReactDOM.make(dom as any)),
      Registry.Default,
      Dispatcher.Default,
      Relay.Default,
      Codec.Default,
      DokenMemory.Default,
    ),
    L.provideMerge(config),
  );

  return {
    ...dom,
    ...makeRuntime(layer),
    layer: layer,
  } as const;
};
