import * as ServerRegistry from '#src/data-registry/server.registry.ts';
import {TestDataServer} from '#unit/.mock/mock-db.testdata.ts';
import {mockDb, mockDbLayer} from '#unit/.mock/mock-db.ts';
import {it} from '@effect/vitest';
import {DateTimes, GetRandomValues} from '@typed/id';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

it.effect('when registering a new server', E.fn(function* () {
  mockDb.get.mockReturnValueOnce(E.succeed({Item: undefined}));

  const actual = yield* pipe(
    ServerRegistry.register({
      caller_id   : 'user',
      caller_roles: ['admin'],
      guild_id    : 'guild',
      payload     : {
        admin: 'admin',
      },
    }),
    E.provide(mockDbLayer),
    E.provide([GetRandomValues.layer(() => E.succeed(new Uint8Array([]))), DateTimes.Fixed(new Date(0))]),
  );

  expect(actual).toMatchSnapshot();
  expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
  expect(mockDb.put.mock.calls[0][0].Item).toMatchSnapshot();
}));

it.effect('when re-registering a server', E.fn(function* () {
  mockDb.get.mockReturnValueOnce(E.succeed({Item: TestDataServer}));

  const actual = yield* pipe(
    ServerRegistry.register({
      caller_id   : 'user',
      caller_roles: ['admin', 'admin2'],
      guild_id    : 'guild',
      payload     : {
        admin: 'admin2',
      },
    }),
    E.provide(mockDbLayer),
    E.provide([GetRandomValues.layer(() => E.succeed(new Uint8Array([]))), DateTimes.Fixed(new Date(0))]),
  );

  expect(actual).toMatchSnapshot();
  expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
  expect(mockDb.put.mock.calls[0][0].Item).toMatchSnapshot();
}));
