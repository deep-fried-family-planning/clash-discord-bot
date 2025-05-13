import {Codec} from '#src/disreact/codec/Codec.ts';
import {Dispatcher} from '#src/disreact/model/Dispatcher.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {Sources} from '#src/disreact/model/Sources.ts';
import {DisReactConfig} from '#src/disreact/runtime/DisReactConfig.ts';
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts';
import {DokenMemory} from '#src/disreact/runtime/DokenMemory.ts';
import * as E from 'effect/Effect';
import * as L from 'effect/Layer';
import {pipe} from 'effect/Function';
import {MessageAsync} from '#test/unit/components/message-async.tsx';
import {TestDialog} from '#test/unit/components/test-dialog.tsx';
import {TestMessage} from '#test/unit/components/test-message.tsx';
import type {Vitest} from '@effect/vitest';
import {it as vfx, vi} from '@effect/vitest';
import {Logger, Redacted, TestServices} from 'effect';
import {MessageEffect} from 'test/unit/components/message-effect.tsx';
import {MessageSync} from './message-sync';

const config = DisReactConfig.configLayer(
  {
    token  : Redacted.make(''),
    sources: [
      <TestDialog/>,
      <TestMessage/>,
      <MessageEffect/>,
      <MessageSync/>,
      <MessageAsync/>,
    ],
  },
);

export const TestRegistry = pipe(
  L.mergeAll(
    L.effectContext(E.succeed(TestServices.liveServices)),
    pipe(
      Sources.Default,
      L.provide(config),
    ),
    Codec.Default.pipe(L.provide(config)),
    Dispatcher.Default,
    L.succeed(
      DisReactDOM,
      DisReactDOM.make({
        discard     : vi.fn(() => E.void) as any,
        dismount    : vi.fn(() => E.void) as any,
        createModal : vi.fn(() => E.void) as any,
        createSource: vi.fn(() => E.void) as any,
        createUpdate: vi.fn(() => E.void) as any,
        deferSource : vi.fn(() => E.void) as any,
        deferUpdate : vi.fn(() => E.void) as any,
        deferEdit   : vi.fn(() => E.void) as any,
      }),
    ).pipe(L.provide(config)),
    DokenMemory.Default.pipe(
      L.provide(config),
    ),
    L.fresh(Relay.Default),
  ),
  L.provideMerge(
    Logger.replace(Logger.defaultLogger, Logger.prettyLoggerDefault),
  ),
);

let local: Vitest.Methods<L.Layer.Success<typeof TestRegistry>> = undefined as any;

vfx.layer(TestRegistry)((it) => local = it as any);

export const it = local;
