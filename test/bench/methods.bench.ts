import {DiscordDOM} from '#src/disreact/adaptors/DiscordDOM.ts';
import * as Methods from '#src/disreact/adaptors/methods.ts';
import * as Runtime from '#src/disreact/adaptors/runtime.ts';
import {TestMessage} from '#unit/components/test-message.tsx';
import {testmessage} from '#unit/runtime/methods.testdata.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as L from 'effect/Layer';
import {bench, describe, vi} from 'vitest';

const createUpdate = vi.fn((...args: any) => E.void);
const deferEdit = vi.fn((...args: any) => E.void);
const deferUpdate = vi.fn((...args: any) => E.void);

const layer = pipe(
  L.empty,
  // L.effectContext(E.succeed(TestServices.liveServices)),
  L.provideMerge(
    Runtime.makeGlobalRuntimeLayer({
      rehydrator: {
        sources: [
          TestMessage,
        ],
      },
      dom: L.succeed(DiscordDOM, DiscordDOM.make({
        createUpdate,
        deferEdit,
        deferUpdate,
        discard: vi.fn(() => E.void),
      } as any)),
    }),
  ),
);

describe.shuffle('methods', () => {
  bench('synthesize', async () => {
    await pipe(
      Methods.createRoot(TestMessage, {}, {}),
      E.provide(layer),
      E.runPromise,
    );
  }, {
    time      : 1000,
    warmupTime: 500,
  });

  bench('respond', async () => {
    await pipe(
      Methods.respond({
        id            : '13781533544247460140',
        token         : 'respond1',
        application_id: 'app',
        user_id       : 'user',
        guild_id      : 'guild',
        message       : testmessage,
        type          : 3,
        data          : {
          custom_id     : 'actions:0:button:0',
          component_type: 2,
        },
      }),
      E.provide(layer),
      E.runPromise,
    );
  }, {
    time      : 1000,
    warmupTime: 500,
  });
});
