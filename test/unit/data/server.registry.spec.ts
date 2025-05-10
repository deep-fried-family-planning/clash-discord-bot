import {ServerRegistry} from '#src/data/index.ts';
import {mockDb, mockDbLayer} from '#unit/data/mock-db.ts';
import {it} from '@effect/vitest';
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
  );

  expect(actual).toMatchSnapshot();
  expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
  expect(mockDb.put.mock.calls[0][0].Item).toMatchSnapshot();
}));

it.effect('when re-registering a server', E.fn(function* () {
  mockDb.get.mockReturnValueOnce(E.succeed({
    Item: {
      _tag             : 'Server',
      admin            : 'admin',
      created          : '1970-01-01T00:00:00.000Z',
      gsi_all_server_id: 's-guild',
      pk               : 's-guild',
      sk               : 'now',
      updated          : '1970-01-01T00:00:00.000Z',
      version          : 0,
    },
  }));

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
  );

  expect(actual).toMatchSnapshot();
  expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
  expect(mockDb.put.mock.calls[0][0].Item).toMatchSnapshot();
}));
