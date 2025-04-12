import {E} from '#src/disreact/utils/re-exports.ts';
import {it} from '@effect/vitest';
import {Fiber} from 'effect';
import {TestMessage} from 'test/unit/components/test-message.tsx';
import {testmessage} from 'test/unit/runtime/methods.testdata.ts';
import {makeTestRuntime, Snap} from 'test/unit/util.ts';
import {SNAP} from 'test/unit/snapkey.ts';



const runtime = makeTestRuntime([TestMessage]);
'eJxrXpSZsjoktbjEN7W4ODE9dWlBUX5B8YFlxSWJydnFTchSExsXFjPsQxKwyoXSBlYeqYkpqUVWBhMAnnIhrA';
'eJy7x8C8KDNldUhqcYlvanFxYnrq0oKi_ILiKwwMy4pLEpOzi-8xMCFLT7zHwLiwmGEfkpBVLpQ2sPJITUxJLbIymAAAQUUi2g';

describe('given function component', () => {
  it.effect('when synthesizing', E.fn(function* () {
    const root = yield* runtime.synthesize(TestMessage);

    // then
    yield* Snap.JSON(root, SNAP.TEST_MESSAGE);
  }));
});

it.effect('when synthesizing (performance)', E.fn(function* () {
  const runs = Array.from({length: 1000});

  for (let i = 0; i < runs.length; i++) {
    const root = yield* runtime.synthesize(TestMessage);

    yield* Snap.JSON(root, SNAP.TEST_MESSAGE);
  }
}));

it.live('when responding', E.fn(function* () {
  const res1 = yield* runtime.respond({
    id            : '1236074574509117491',
    token         : 'respond1',
    application_id: 'app',
    user_id       : 'user',
    guild_id      : 'guild',
    message       : testmessage,
    type          : 2,
    data          : {
      custom_id     : 'actions:2:button:0',
      component_type: 2,
    },
  });

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

  yield* Snap.JSON(runtime.deferEdit.mock.calls[0][1], SNAP.TEST_MESSAGE, '1');
  yield* Snap.JSON(runtime.deferEdit.mock.calls[1][1], SNAP.TEST_MESSAGE, '2');
}));

it.live('when responding (performance)', E.fn(function* () {
  const times = Array.from({length: 1000});

  for (let i = 0; i < times.length; i++) {
    times[i] = runtime.respond({
      id            : '1236074574509117491',
      token         : 'respond1',
      application_id: 'app',
      user_id       : 'user',
      guild_id      : 'guild',
      message       : testmessage,
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
