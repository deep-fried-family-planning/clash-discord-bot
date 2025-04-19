import {Codec} from '#src/disreact/codec/Codec.ts';
import {DokenMemory} from '#src/disreact/utils/DokenMemory.ts';
import {Dispatcher} from '#src/disreact/model/Dispatcher.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import type {FC} from '#src/disreact/model/elem/fc.ts';
import {Registry} from '#src/disreact/model/Registry.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {DisReactConfig} from '#src/disreact/utils/DisReactConfig.ts';
import {DisReactDOM} from '#src/disreact/utils/DisReactDOM.ts';
import {makeRuntime} from '#src/disreact/runtime/runtime.ts';
import {E, L, pipe} from '#src/internal/pure/effect.ts';
import {type Mock, vi} from '@effect/vitest';
import {Redacted} from 'effect';

const makeStub = (random = true) =>
  vi.fn(() => random
    ? pipe(
      E.void,
      E.delay(Math.random() * 10),
    )
    : E.void,
  ) as Mock<(...args: any) => any>;

export const makeTestRuntime = (src: (Elem | FC)[], random?: boolean) => {
  const config = DisReactConfig.configLayer({
    token  : Redacted.make(''),
    sources: src,
  });

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
