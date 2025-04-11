import {E} from '#src/disreact/utils/re-exports.ts';
import {it} from '@effect/vitest';
import {Fiber} from 'effect';
import {TestMessage} from 'test/unit/components/test-message.tsx';
import {makeTestRuntime} from 'test/unit/scenarios/util.tsx';



const runtime = makeTestRuntime([TestMessage], false);

it.effect('when synthesizing', E.fn(function* () {
  const root = yield* runtime.synthesize(TestMessage);

  yield* E.promise(() =>
    expect(JSON.stringify(root, null, 2)).toMatchFileSnapshot('./.snap/TestMessage.json'),
  );
}));

it.effect('when synthesizing (performance)', E.fn(function* ({expect}) {
  const runs = Array.from({length: 1000});

  for (let i = 0; i < runs.length; i++) {
    const root = yield* runtime.synthesize(TestMessage);

    yield* E.promise(() =>
      expect(JSON.stringify(root, null, 2)).toMatchFileSnapshot('./.snap/TestMessage.json'),
    );
  }
}));

it.live('when responding', E.fn(function* ({expect}) {
  const root = yield* runtime.synthesize(TestMessage);

  const res1 = yield* runtime.respond({
    id            : '1236074574509117491',
    token         : 'respond1',
    application_id: 'app',
    user_id       : 'user',
    guild_id      : 'guild',
    message       : root,
    type          : 2,
    data          : {
      custom_id     : 'actions:2:button:0',
      component_type: 2,
    },
  });

  yield* E.promise(() =>
    expect(JSON.stringify(runtime.deferEdit.mock.calls[0][1], null, 2)).toMatchFileSnapshot('./.snap/TestMessage1.json', 'response 1'),
  );

  yield* runtime.respond({
    message       : res1,
    id            : '1236074574509117491',
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
    expect(JSON.stringify(runtime.deferEdit.mock.calls[1][1], null, 2)).toMatchFileSnapshot('./.snap/TestMessage2.json', 'response 2'),
  );
}));

it.live('when responding (performance)', E.fn(function* () {
  const times = Array.from({length: 1000});

  for (let i = 0; i < times.length; i++) {
    const root = yield* runtime.synthesize(TestMessage);

    times[i] = runtime.respond({
      id            : '1236074574509117491',
      token         : 'respond1',
      application_id: 'app',
      user_id       : 'user',
      guild_id      : 'guild',
      message       : root,
      type          : 2,
      data          : {
        custom_id     : 'actions:2:button:0',
        component_type: 2,
      },
    });
  }
  const fibers = yield* E.forkAll(times as E.Effect<void>[]);
  yield* Fiber.join(fibers);
}));
