import {Codec} from '#src/disreact/codec/Codec.ts';
import {DokenMemory} from '#src/disreact/codec/DokenMemory.ts';
import {HooksDispatcher} from '#src/disreact/model/HooksDispatcher.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {Registry} from '#src/disreact/model/Registry.ts';
import {DisReactConfig} from '#src/disreact/runtime/DisReactConfig.ts';
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts';
import {E, L, pipe} from '#src/internal/pure/effect.ts';
import type {Vitest} from '@effect/vitest';
import {expect, it as vfx, vi} from '@effect/vitest';
import {Logger, Redacted, TestServices} from 'effect';
import {TestDialog} from 'test/unit/components/test-dialog.tsx';
import {TestMessage} from 'test/unit/components/test-message.tsx';

export const expectJSON = (filename: string) => (actual: any) =>
  E.promise(
    async () =>
      await expect(JSON.stringify(actual, null, 2)).toMatchFileSnapshot(filename),
  );

const config = DisReactConfig.configLayer(
  {
    token: Redacted.make(''),
    modal: [
      <TestDialog/>,
    ],
    ephemeral: [
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
    HooksDispatcher.Default,
    L.succeed(
      DisReactDOM,
      DisReactDOM.make({
        defer       : vi.fn(() => E.void),
        discard     : vi.fn(() => E.void),
        create      : vi.fn(() => E.void),
        reply       : vi.fn(() => E.void),
        dismount    : vi.fn(() => E.void),
        createModal : vi.fn(() => E.void),
        createSource: vi.fn(() => E.void),
        createUpdate: vi.fn(() => E.void),
        deferSource : vi.fn(() => E.void),
        deferUpdate : vi.fn(() => E.void),
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

let local: Vitest.Methods<L.Layer.Success<typeof TestRegistry>>;

vfx.layer(TestRegistry)((it) => local = it as any);

// @ts-expect-error testing convenience
export const it = local;
