import {Snowflake} from '#src/disreact/codec/dapi/snowflake';
import {DiscordDOM} from '#src/disreact/runtime/DiscordDOM.ts';
import {Methods} from '#src/disreact/runtime/methods.ts';
import {Runtime} from '#src/disreact/runtime/runtime';
import {TestMessage} from '#test/unit/components/test-message.tsx';
import {testmessage} from '#test/unit/runtime/methods.testdata.ts';
import {SNAP} from '#test/unit/snapkey.ts';
import {Snap} from '#test/unit/util.ts';
import {it, vi} from '@effect/vitest';
import * as Cause from 'effect/Cause';
import * as DateTime from 'effect/DateTime';
import * as Duration from 'effect/Duration';
import * as E from 'effect/Effect';
import * as Fiber from 'effect/Fiber';
import * as L from 'effect/Layer';
import * as Logger from 'effect/Logger';
import * as LogLevel from 'effect/LogLevel';
import * as Supervisor from 'effect/Supervisor';
import * as TestClock from 'effect/TestClock';
import * as TestServices from 'effect/TestServices';

const createUpdate = vi.fn((...args: any) => E.void);
const deferEdit = vi.fn((...args: any) => E.void);
const deferUpdate = vi.fn((...args: any) => E.void);

const layer = Runtime.makeGlobalRuntimeLayer({
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
}).pipe(
  L.provideMerge(L.effectContext(E.succeed(TestServices.liveServices))),
  L.provideMerge(Logger.pretty),
  L.provideMerge(Logger.minimumLogLevel(LogLevel.All)),
  L.provideMerge(L.setTracerEnabled(true)),
  L.provideMerge(L.setTracerTiming(true)),
  // L.provideMerge(
  //   NodeSdk.layer(() => ({
  //     resource     : { serviceName: 'test' },
  //     // Export span data to the console
  //     spanProcessor: new BatchSpanProcessor(new ConsoleSpanExporter()),
  //   })),
  // ),
);

it.effect('when synthesizing', E.fn(function* () {
  const root = yield* Methods.createRoot(TestMessage);
  yield* Snap.JSON(root, SNAP.TEST_MESSAGE);
}, E.provide(layer)));

it.effect('when synthesizing (performance)', E.fn(function* () {
  const runs = Array.from({length: 1000});

  for (let i = 0; i < runs.length; i++) {
    const root = yield* Methods.createRoot(TestMessage);

    yield* Snap.JSON(root, SNAP.TEST_MESSAGE);
  }
}, E.provide(layer)));

it.effect('when responding', E.fn(
  function* () {
    const req1 = {
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
    };

    yield* Snowflake.toDateTime(req1.id).pipe(
      DateTime.subtract({seconds: 10}),
      TestClock.setTime,
    );

    const supervisor = yield* Supervisor.track;

    const res1Fork = yield* Methods.respond(req1).pipe(
      E.tapErrorCause((cause) => E.logFatal(Cause.prettyErrors(cause))),
      E.supervised(supervisor),
      E.fork,
    );

    yield* TestClock.adjust(Duration.seconds(12));

    const res1 = yield* Fiber.join(res1Fork);

    // yield* TestServices.supervisedFibers().pipe(E.tap(E.logTrace));

    const req2 = {
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
    };

    yield* Snowflake.toDateTime(req2.id).pipe(
      DateTime.subtract({seconds: 10}),
      TestClock.setTime,
    );

    const req2Fork = yield* E.fork(Methods.respond(req2));

    yield* TestClock.adjust(Duration.seconds(12));

    yield* Fiber.join(req2Fork);

    expect(createUpdate).toBeCalledTimes(2);
    expect(deferUpdate).toBeCalledTimes(0);
    expect(deferEdit).toBeCalledTimes(0);
    yield* Snap.JSON(createUpdate.mock.calls[0][1], SNAP.TEST_MESSAGE, '1');
    yield* Snap.JSON(createUpdate.mock.calls[1][1], SNAP.TEST_MESSAGE, '2');
  },
  E.provide(layer),
));

it.effect('when responding (performance)', E.fn(
  function* () {
    const runs = Array.from({length: 10});

    const req1 = {
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
    };

    for (let i = 0; i < runs.length; i++) {
      yield* Snowflake.toDateTime(req1.id).pipe(
        DateTime.subtract({seconds: 10}),
        TestClock.setTime,
      );

      const fork = yield* E.fork(Methods.respond(req1).pipe(
        Logger.withMinimumLogLevel(LogLevel.None),
      ));

      yield* TestClock.adjust(Duration.seconds(12));

      yield* Fiber.join(fork);
    }
  },
  E.provide(layer),
));
