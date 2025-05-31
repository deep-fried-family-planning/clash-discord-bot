import {DiscordDOM} from '#src/disreact/runtime/DiscordDOM.ts';
import {Methods} from '#src/disreact/runtime/methods';
import {Runtime} from '#src/disreact/runtime/runtime';
import {bench, vi} from '@effect/vitest';
import {TestServices} from 'effect';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as L from 'effect/Layer';
import {TestMessage} from 'test/unit/components/test-message.tsx';
import {testmessage} from 'test/unit/runtime/methods.testdata.ts';
import {makeTestRuntime} from 'test/unit/util.ts';

const createUpdate = vi.fn((...args: any) => E.void);
const deferEdit = vi.fn((...args: any) => E.void);
const deferUpdate = vi.fn((...args: any) => E.void);

const layer = pipe(
  L.effectContext(E.succeed(TestServices.liveServices)),
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

const runtime = makeTestRuntime([TestMessage], false);

describe('synthesize', () => {
  bench('scoped', async () => {
    await pipe(
      Methods.createRoot(TestMessage, {}, {}),
      E.provide(layer),
      E.runPromise,
    );
  });

  bench('runtime', async () => {
    await pipe(
      runtime.synthesize(TestMessage, {}, {}),
      E.runPromise,
    );
  });
});

const runtimeRoot = await E.runPromise(runtime.synthesize(TestMessage, {}, {}));

describe('respond', () => {
  bench('scoped', async () => {
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
  });

  bench('runtime', async () => {
    await pipe(
      runtime.respond({
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
      E.runPromise,
    );
  });
});
