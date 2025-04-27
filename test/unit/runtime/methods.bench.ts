import {Relay} from '#src/disreact/model/Relay.ts';
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts';
import {Methods} from '#src/disreact/runtime/methods';
import {Runtime} from '#src/disreact/runtime/runtime';
import {L, pipe} from '#src/disreact/utils/re-exports.ts';
import {E} from '#src/internal/pure/effect.ts';
import {bench, vi} from '@effect/vitest';
import {TestServices} from 'effect';
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
      config: {
        token  : '',
        sources: [
          TestMessage,
        ],
      },
      dom: L.succeed(DisReactDOM, DisReactDOM.make({
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
      Methods.createRoot(TestMessage),
      E.provide(layer),
      E.runPromise,
    );
  });

  bench('runtime', async () => {
    await pipe(
      runtime.synthesize(TestMessage),
      E.runPromise,
    );
  });
});

const runtimeRoot = await E.runPromise(runtime.synthesize(TestMessage));

describe('respond', () => {
  bench('scoped', async () => {
    await pipe(
      Methods.respond({
        id            : '1236074574509117491',
        token         : 'respond1',
        application_id: 'app',
        user_id       : 'user',
        guild_id      : 'guild',
        message       : testmessage,
        type          : 3,
        data          : {
          custom_id     : 'actions:2:button:0',
          component_type: 2,
        },
      }).pipe(E.provide(Relay.Fresh), E.scoped),
      E.provide(layer),
      E.runPromise,
    );
  });

  bench('runtime', async () => {
    await pipe(
      runtime.respond({
        id            : '1236074574509117491',
        token         : 'respond1',
        application_id: 'app',
        user_id       : 'user',
        guild_id      : 'guild',
        message       : testmessage,
        type          : 3,
        data          : {
          custom_id     : 'actions:2:button:0',
          component_type: 2,
        },
      }),
      E.runPromise,
    );
  });
});
