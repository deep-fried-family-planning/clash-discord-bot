import {Codec} from '#src/disreact/adaptor/codec/Codec.ts';
import {Relay} from '#src/disreact/adaptor/adaptor/Relay.ts';
import {Rehydrator} from '#src/disreact/adaptor/adaptor/Rehydrator.ts';
import {DiscordDOM} from '#src/disreact/adaptor/DiscordDOM.ts';
import {DokenCache} from '#src/disreact/adaptor/DokenCache.ts';
import {MessageAsync} from '#test/unit/components/message-async.tsx';
import {TestDialog} from '#test/unit/components/test-dialog.tsx';
import {TestMessage} from '#test/unit/components/test-message.tsx';
import type {Vitest} from '@effect/vitest';
import {it as vfx, vi} from '@effect/vitest';
import * as E from 'effect/Effect';
import * as L from 'effect/Layer';
import * as Logger from 'effect/Logger';
import * as TestServices from 'effect/TestServices';
import {MessageEffect} from 'test/unit/components/message-effect.tsx';
import {MessageSync} from './message-sync';

export const TestRegistry = L.mergeAll(
  L.effectContext(E.succeed(TestServices.liveServices)),
  Codec.Default(),
  Rehydrator.Default({
    sources: [
      <TestDialog source={'asdf'}/>,
      <TestMessage/>,
      <MessageEffect/>,
      <MessageSync source={'asdf'}/>,
      <MessageAsync/>,
    ],
  }),
  L.succeed(DiscordDOM, DiscordDOM.make({
    discard     : vi.fn(() => E.void) as any,
    dismount    : vi.fn(() => E.void) as any,
    createModal : vi.fn(() => E.void) as any,
    createSource: vi.fn(() => E.void) as any,
    createUpdate: vi.fn(() => E.void) as any,
    deferSource : vi.fn(() => E.void) as any,
    deferUpdate : vi.fn(() => E.void) as any,
    deferEdit   : vi.fn(() => E.void) as any,
  })),
  DokenCache.Default({capacity: 1}),
  L.fresh(Relay.Fresh),
  Logger.replace(Logger.defaultLogger, Logger.prettyLoggerDefault),
);

let local: Vitest.Methods<L.Layer.Success<typeof TestRegistry>> = undefined as any;

vfx.layer(TestRegistry)((it) => local = it as any);

export const it = local;
