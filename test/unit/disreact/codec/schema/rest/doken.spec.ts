import {E, L, RDT} from '#src/internal/pure/effect.ts';
import {layer} from '@effect/vitest';
import {DateTime, Logger, LogLevel, pipe, TestClock, TestContext} from 'effect';
import * as Doken from '#src/disreact/codec/schema/rest/doken.ts';



const describe = pipe(
  L.empty,
  L.provideMerge(TestContext.TestContext),
  L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.prettyLoggerDefault)),
  L.provideMerge(Logger.minimumLogLevel(LogLevel.All)),
  layer,
);



describe('Fresh Doken', (it) => {
  it.effect('when making', E.fn(function* () {
    yield* TestClock.setTime(0);

    const actual = yield* Doken.makeFresh({
      rest: {
        id            : 'testid',
        application_id: 'testappid',
        token         : 'testtoken',
      },
    });

    expect(actual).toMatchSnapshot();
  }));

  it.effect('given DateTime, when making', E.fn(function* () {
    yield* TestClock.setTime(1000);

    const actual = yield* Doken.makeFresh({
      rest: {
        id            : 'testid',
        application_id: 'testappid',
        token         : 'testtoken',
      },
      time: DateTime.unsafeMake('2025-02-21T03:51:48.193Z'),
    });

    expect(actual).toMatchSnapshot();
  }));
});



describe('Params Doken', (it) => {
  it.effect('given future TTL, when making params doken', E.fn(function* () {
    yield* TestClock.setTime(1000);

    const actual = yield* Doken.makeFromParams({
      id       : 'testid',
      ttl      : 100000000,
      app_id   : 'testappid',
      token    : RDT.make('testtoken'),
      ephemeral: 0,
      type     : 0,
    });

    expect(actual).toMatchSnapshot();
  }));

  it.effect('given past TTL, when making params doken', E.fn(function* () {
    yield* TestClock.setTime(1000);

    const actual = yield* Doken.makeFromParams({
      id       : 'testid',
      ttl      : 0,
      app_id   : 'testappid',
      token    : RDT.make('testtoken'),
      ephemeral: 0,
      type     : 0,
    });

    expect(actual).toMatchSnapshot();
  }));
});



describe('Active Doken', (it) => {
  it.effect('when activating', E.fn(function* () {
    yield* TestClock.setTime(0);

    const actual = yield* Doken.activate({
      doken: {
        _tag     : 'Doken',
        id       : 'testid',
        app_id   : 'testappid',
        token    : RDT.make('testtoken'),
        ttl      : DateTime.unsafeMake(0),
        ephemeral: 0,
        type     : 0,
        status   : 'Fresh',
      },
    });

    expect(actual).toMatchSnapshot();
  }));
});



describe('Spent Doken', (it) => {
  it.effect('when spending', E.fn(function* () {
    yield* TestClock.setTime(0);

    const actual = Doken.spend({
      doken: {
        _tag     : 'Doken',
        id       : 'testid',
        app_id   : 'testappid',
        token    : RDT.make('testtoken'),
        ttl      : DateTime.unsafeMake(0),
        ephemeral: 0,
        type     : 0,
        status   : 'Fresh',
      },
    });

    expect(actual).toMatchSnapshot();
  }));
});
