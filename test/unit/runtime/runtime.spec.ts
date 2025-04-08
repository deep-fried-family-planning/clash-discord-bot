import {DokenMemory} from '#src/disreact/codec/DokenMemory.ts';
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts';
import {Runtime} from '#src/disreact/runtime/runtime.ts';
import {E, L, pipe} from '#src/disreact/utils/re-exports.ts';
import {it} from '@effect/vitest';
import {Logger} from 'effect';
import {TestMessage} from 'test/unit/components/test-message.tsx';
import TestMessageJSON from 'test/unit/runtime/.runtime/TestMessage.json';

const createUpdate = vi.fn(() => E.void);
const reply = vi.fn(() => E.void);
const deferUpdate = vi.fn(() => E.void);

const layer = Runtime.makeGlobalRuntimeLayer({
  config: {
    token    : 'token',
    ephemeral: [
      TestMessage,
    ],
  },
  dom: L.succeed(
    DisReactDOM,
    DisReactDOM.make({
      createUpdate,
      reply,
      deferUpdate,
    } as any),
  ),
  memory: DokenMemory.Default,
});

const runtime = Runtime.makeRuntime(
  pipe(
    layer,
    L.provideMerge(
      Logger.replace(Logger.defaultLogger, Logger.prettyLoggerDefault),
    ),
  ),
);

it.effect('when synthesizing', E.fn(function* () {
  const root = yield* runtime.synthesize(TestMessage);

  yield* E.promise(() =>
    expect(JSON.stringify(root, null, 2)).toMatchFileSnapshot('./.runtime/TestMessage.json'),
  );
}));

it.effect('when synthesizing (performance)', E.fn(function* () {
  const runs = Array.from({length: 10000});

  for (let i = 0; i < runs.length; i++) {
    const root = yield* runtime.synthesize(TestMessage);

    yield* E.promise(() =>
      expect(JSON.stringify(root, null, 2)).toMatchFileSnapshot('./.runtime/TestMessage.json'),
    );
  }
}));

it.effect('when responding', E.fn(function* () {
  yield* runtime.respond({
    id            : '1359103729483251722',
    token         : 'respond1',
    application_id: 'app',
    user_id       : 'user',
    guild_id      : 'guild',
    message       : TestMessageJSON,
    type          : 2,
    data          : {
      custom_id     : 'actions:2:button:0',
      component_type: 2,
    },
  });

  yield* E.promise(() =>
    expect(JSON.stringify(reply.mock.calls[0][1], null, 2)).toMatchFileSnapshot('./.runtime/TestMessage1.json'),
  );

  yield* runtime.respond({
    message       : reply.mock.calls[0][1],
    id            : '1359103729483251722',
    token         : 'respond2',
    application_id: 'app',
    user_id       : 'user',
    guild_id      : 'guild',
    type          : 2,
    data          : {
      custom_id     : 'actions:2:button:0',
      component_type: 2,
    },
  });

  yield* E.promise(() =>
    expect(JSON.stringify(reply.mock.calls[1][1], null, 2)).toMatchFileSnapshot('./.runtime/TestMessage2.json'),
  );
}));

const test = () =>
  pipe(
    Array.from<number>({length: 10000}).map((_, idx) =>
      pipe(
        E.log(`Start ${idx}`),
        E.tap(runtime.respond({
          id            : '1236074574509117491',
          token         : 'respond1',
          application_id: 'app',
          user_id       : 'user',
          guild_id      : 'guild',
          message       : TestMessageJSON,
          type          : 2,
          data          : {
            custom_id     : 'actions:2:button:0',
            component_type: 2,
          },
        })),
        E.tap(E.log(`Done ${idx}`)),
      ),
    ),
    E.allWith({concurrency: 'unbounded', concurrentFinalizers: true}),
  );

it.live('when responding (performance)', test, {timeout: 20000});
