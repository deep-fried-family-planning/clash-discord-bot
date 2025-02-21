import {E, L, RDT} from '#src/internal/pure/effect.ts';
import {layer} from '@effect/vitest';
import {DateTime, Logger, LogLevel, pipe, TestContext} from 'effect';
import * as Route from '#src/disreact/codec/rest/route.ts';



const describe = pipe(
  L.empty,
  L.provideMerge(TestContext.TestContext),
  L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.prettyLoggerDefault)),
  L.provideMerge(Logger.minimumLogLevel(LogLevel.All)),
  layer,
);



describe('Route - Message', (it) => {
  it.effect('when encoding', E.fn(function* () {
    const actual = Route.encodeMessageRoute({
      origin: 'Message',
      root  : 'root',
      hash  : 'hash',
      doken : {
        _tag     : 'Doken',
        id       : 'id',
        app_id   : 'app_id',
        token    : RDT.make('token'),
        ttl      : DateTime.unsafeMake(0),
        ephemeral: 0,
        type     : 0,
        status   : 'Active',
      },
    });

    expect(actual).toMatchSnapshot();
  }));

  it.effect('when decoding', E.fn(function* () {
    const actual = Route.decodeMessageRoute('dsx/root/0/0/id/0/2/token/hash');

    expect(actual).toMatchSnapshot();
  }));
});



describe('Route - Dialog', (it) => {
  it.effect('when encoding', E.fn(function* () {
    const actual = Route.encodeDialogRoute({
      origin: 'Message',
      root  : 'root',
      hash  : 'hash',
      doken : {
        _tag     : 'Doken',
        id       : 'id',
        app_id   : 'app_id',
        token    : RDT.make('token'),
        ttl      : DateTime.unsafeMake(0),
        ephemeral: 0,
        type     : 0,
        status   : 'Active',
      },
    });

    expect(actual).toMatchSnapshot();
  }));

  it.effect('when decoding', E.fn(function* () {
    const actual = Route.decodeDialogRoute('dsx/root/0/0/id/0');

    expect(actual).toMatchSnapshot();
  }));
});
