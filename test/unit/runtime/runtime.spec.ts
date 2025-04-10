import {E} from '#src/disreact/utils/re-exports.ts';
import {it} from '@effect/vitest';
import {Fiber} from 'effect';
import {TestMessage} from 'test/unit/components/test-message.tsx';
import TestMessageJSON from 'test/unit/runtime/.runtime/TestMessage.json';
import {makeTestRuntime} from 'test/unit/scenarios/util.tsx';

const runtime = makeTestRuntime(TestMessage);

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
    expect(JSON.stringify(runtime.deferEdit.mock.calls[0][1], null, 2)).toMatchFileSnapshot('./.runtime/TestMessage1.json'),
  );

  yield* runtime.respond({
    message       : runtime.deferEdit.mock.calls[0][1],
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
    expect(JSON.stringify(runtime.deferEdit.mock.calls[1][1], null, 2)).toMatchFileSnapshot('./.runtime/TestMessage2.json'),
  );
}));

it.effect('when responding (performance)', E.fn(function* () {
  const times = Array.from({length: 10000});

  for (let i = 0; i < times.length; i++) {
    times[i] = runtime.respond({
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
    });
  }
  const fibers = yield* E.forkAll(times as E.Effect<void>[]);
  yield* Fiber.join(fibers);
}), {timeout: 200000});
