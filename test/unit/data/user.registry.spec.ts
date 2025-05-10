import {DataTag} from '#src/data/constants/index.ts';
import {UserRegistry} from '#src/data/index.ts';
import {mockDb, mockDbLayer} from '#unit/data/mock-db.ts';
import {it} from '@effect/vitest';
import * as DateTime from 'effect/DateTime';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

it.effect('when registering a new user', E.fn(function* () {
  mockDb.get.mockReturnValueOnce(E.succeed({Item: undefined}));

  const actual = yield* pipe(
    UserRegistry.register({
      caller_id: 'user',
      payload  : {
        timezone: DateTime.zoneUnsafeMakeNamed('America/Chicago'),
      },
    }),
    E.provide(mockDbLayer),
  );

  expect(actual).toMatchSnapshot();
  expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
  expect(mockDb.put.mock.calls[0][0].Item).toMatchSnapshot();
}));

it.effect('when re-registering a user', E.fn(function* () {
  mockDb.get.mockReturnValueOnce(E.succeed({
    Item: {
      _tag           : DataTag.USER,
      pk             : 'u-user',
      sk             : 'now',
      version        : 0,
      created        : DateTime.unsafeMake(0).pipe(DateTime.format()),
      updated        : DateTime.unsafeMake(0).pipe(DateTime.format()),
      gsi_all_user_id: 'u-user',
      timezone       : 'America/New_York',
    },
  }));

  const actual = yield* pipe(
    UserRegistry.register({
      caller_id: 'user',
      payload  : {
        timezone: DateTime.zoneUnsafeMakeNamed('America/Chicago'),
      },
    }),
    E.provide(mockDbLayer),
  );

  expect(actual).toMatchSnapshot();
  expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
  expect(mockDb.put.mock.calls[0][0].Item).toMatchSnapshot();
}));

it.effect('when admin registering a new user', E.fn(function* () {
  mockDb.get
    .mockReturnValueOnce(E.succeed({
      Item: {
        _tag           : DataTag.USER,
        pk             : 'u-user1',
        sk             : 'now',
        version        : 0,
        created        : DateTime.unsafeMake(0).pipe(DateTime.format()),
        updated        : DateTime.unsafeMake(0).pipe(DateTime.format()),
        gsi_all_user_id: 'u-user1',
        timezone       : 'America/New_York',
      },
    }))
    .mockReturnValueOnce(E.succeed({Item: undefined}));

  const actual = yield* pipe(
    UserRegistry.register({
      caller_id: 'user1',
      target_id: 'user2',
      payload  : {
        timezone: DateTime.zoneUnsafeMakeNamed('America/Chicago'),
      },
    }),
    E.provide(mockDbLayer),
  );

  expect(actual).toMatchSnapshot();
  expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
  expect(mockDb.put.mock.calls[0][0].Item).toMatchSnapshot();
}));

it.effect('when admin registering a current user', E.fn(function* () {
  mockDb.get
    .mockReturnValueOnce(E.succeed({
      Item: {
        _tag           : DataTag.USER,
        pk             : 'u-user1',
        sk             : 'now',
        version        : 0,
        created        : DateTime.unsafeMake(0).pipe(DateTime.format()),
        updated        : DateTime.unsafeMake(0).pipe(DateTime.format()),
        gsi_all_user_id: 'u-user1',
        timezone       : 'America/New_York',
      },
    }))
    .mockReturnValueOnce(E.succeed({
      Item: {
        _tag           : DataTag.USER,
        pk             : 'u-user2',
        sk             : 'now',
        version        : 0,
        created        : DateTime.unsafeMake(0).pipe(DateTime.format()),
        updated        : DateTime.unsafeMake(0).pipe(DateTime.format()),
        gsi_all_user_id: 'u-user2',
        timezone       : 'America/New_York',
      },
    }));

  const actual = yield* pipe(
    UserRegistry.register({
      caller_id: 'user1',
      target_id: 'user2',
      payload  : {
        timezone: DateTime.zoneUnsafeMakeNamed('America/Chicago'),
      },
    }),
    E.provide(mockDbLayer),
    E.catchAll((cause) => E.succeed(cause)),
  );

  expect(actual).toMatchSnapshot();
  expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
  expect(mockDb.put).toBeCalledTimes(0);
}));
