import {Codec} from '#src/disreact/adaptor/codec/Codec.ts';
import type * as Element from '#src/disreact/adaptor/adaptor/element.ts';
import type * as FC from '#disreact/model/core/internal/fn.ts';
import {Rehydrator} from '#src/disreact/adaptor/adaptor/Rehydrator.ts';
import {DiscordDOM} from '#disreact/rest/DiscordDOM.ts';
import {DokenCache} from '#disreact/rest/DokenCache.ts';
import {makeRuntime} from '#src/disreact/adaptor/runtime.ts';
import {type Mock, vi, expect as viexpect, chai} from '@effect/vitest';
import {DiscordREST} from 'dfx';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import * as TestServices from 'effect/TestServices';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as L from 'effect/Layer';

const makeStub = (random = true) =>
  vi.fn(() => random
    ? pipe(
      E.void,
      E.delay(Math.random() * 10),
    )
    : E.void,
  ) as Mock<(...args: any) => any>;

export const makeTestRuntime = (src: (Element.Element | FC.FC)[], random?: boolean, live?: boolean) => {
  const dom = {
    discard     : makeStub(random),
    dismount    : makeStub(random),
    deferEdit   : makeStub(random),
    createModal : makeStub(random),
    createSource: makeStub(random),
    createUpdate: makeStub(random),
    deferSource : makeStub(random),
    deferUpdate : makeStub(random),
  } as const;

  const layer = pipe(
    L.mergeAll(
      // L.effectContext(E.succeed(TestServices.liveServices)),
      L.succeed(DiscordDOM, DiscordDOM.make(dom as any)),
      Rehydrator.Default({
        sources: src,
      }),
      Codec.Default(),
      DokenCache.Default({capacity: 0}),
    ),
    L.provideMerge(L.succeed(DiscordREST, {} as any)),
    // L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.prettyLoggerDefault)),
    // L.provideMerge(Logger.minimumLogLevel(LogLevel.All)),
  );

  return {
    ...dom,
    ...makeRuntime(layer),
    layer: layer,
  } as const;
};

export const makeTestRequest = (data: any, message: any) => {
  return {
    id            : '1236074574509117491',
    token         : 'respond1',
    type          : 2,
    data          : data,
    message       : message,
    application_id: 'app',
    user_id       : 'user',
    guild_id      : 'guild',
  };
};

export * as Snap from '#test/unit/util.ts';
export type Snap = never;

export const key = (name: string, post?: string) =>
  post
    ? `./.snap/${name}${post}.json`
    : `./.snap/${name}.json`;

export const JSON = (input: any, file: string, post?: string) => {
  const serial = global.JSON.stringify(input, null, 2);

  return E.promise(async () =>
    await expect(serial).toMatchFileSnapshot(key(file, post)),
  );
};

export declare namespace Chai {
  export interface Assertion {
    toMatchFileSnapshotEffect(file: string, post?: string): E.Effect<void>;
  }
}

export const expect = Object.assign(viexpect, {
  toMatchFileSnapshotEffect: (input: any, file: string, post?: string) => {
    const serial = global.JSON.stringify(input, null, 2);
    return E.promise(async () =>
      await viexpect(serial).toMatchFileSnapshot(key(file, post)),
    );
  },
});
