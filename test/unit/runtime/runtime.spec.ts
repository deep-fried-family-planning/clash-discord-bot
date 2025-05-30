import {Snowflake} from '#src/disreact/codec/dapi/snowflake.ts';
import {it} from '@effect/vitest';
import * as DateTime from 'effect/DateTime';
import * as Duration from 'effect/Duration';
import * as E from 'effect/Effect';
import * as Fiber from 'effect/Fiber';
import {pipe} from 'effect/Function';
import * as TestClock from 'effect/TestClock';
import {TestMessage} from 'test/unit/components/test-message.tsx';
import {SNAP} from 'test/unit/snapkey.ts';
import {makeTestRuntime, Snap} from 'test/unit/util.ts';

const runtime = makeTestRuntime([TestMessage]);

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

const testmessage = await import(Snap.key(SNAP.TEST_MESSAGE));

it.effect('when responding', E.fn(function* () {
  yield* Snowflake.toDateTime('1236074574509117491').pipe(
    DateTime.subtract({seconds: 10}),
    TestClock.setTime,
  );

  const fib1 = yield* E.fork(runtime.respond({
    id            : '1236074574509117491',
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
  }));

  yield* TestClock.adjust(Duration.seconds(13));

  const res1 = yield* Fiber.join(fib1);

  yield* Snowflake.toDateTime('1236074574509117491').pipe(
    DateTime.subtract({seconds: 10}),
    TestClock.setTime,
  );

  const fib2 = yield* pipe(
    runtime.respond({
      message       : res1,
      id            : '1236074574509117491',
      token         : 'respond2',
      application_id: 'app',
      user_id       : 'user',
      guild_id      : 'guild',
      type          : 3,
      data          : {
        custom_id     : 'actions:0:button:0',
        component_type: 2,
      },
    }),
    E.fork,
  );
  yield* TestClock.adjust(Duration.seconds(15));
  yield* Fiber.join(fib2);

  yield* Snap.JSON(runtime.deferEdit.mock.calls[0][1], SNAP.TEST_MESSAGE, '3');
  yield* Snap.JSON(runtime.deferEdit.mock.calls[0][1], SNAP.TEST_MESSAGE, '4');
}));

it.effect('when responding (performance)', E.fn(function* () {
  const times = Array.from({length: 100});

  for (let i = 0; i < times.length; i++) {
    times[i] = runtime.respond({
      id            : '1236074574509117491',
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
    });
  }
  const fibers = yield* E.forkAll(times as E.Effect<void>[]);
  yield* TestClock.setTime(17214773545718);
  yield* Fiber.join(fibers);
}));
