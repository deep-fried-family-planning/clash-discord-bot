import {Codec} from '#src/disreact/codec/Codec.ts';
import {DokenMemory} from '#src/disreact/codec/DokenMemory.ts';
import {Dispatcher} from '#src/disreact/model/Dispatcher.ts';
import {Registry} from '#src/disreact/model/Registry.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {DisReactConfig} from '#src/disreact/utils/DisReactConfig.ts';
import {DisReactDOM} from '#src/disreact/utils/DisReactDOM.ts';
import {E, L, pipe} from '#src/internal/pure/effect.ts';
import {TestDialog} from '#test/unit/components/test-dialog.tsx';
import {TestMessage} from '#test/unit/components/test-message.tsx';
import type {Vitest} from '@effect/vitest';
import {it as vfx, vi} from '@effect/vitest';
import {Logger, Redacted, TestServices} from 'effect';



const config = DisReactConfig.configLayer(
  {
    token  : Redacted.make(''),
    sources: [
      <TestDialog/>,
      <TestMessage/>,
    ],
  },
);


export const TestRegistry = pipe(
  L.mergeAll(
    L.effectContext(E.succeed(TestServices.liveServices)),
    pipe(
      Registry.Default,
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
