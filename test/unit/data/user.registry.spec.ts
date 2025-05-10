import {DataTag} from '#src/data/constants/index.ts';
import {type User, UserRegistry} from '#src/data/index.ts';
import {DeepFryerDB} from '#src/service/DeepFryerDB.ts';
import type {DeleteCommandInput, GetCommandInput, PutCommandInput, QueryCommandInput, ScanCommandInput} from '@aws-sdk/lib-dynamodb';
import {it, vi} from '@effect/vitest';
import * as DateTime from 'effect/DateTime';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as L from 'effect/Layer';

const mock = {
  get   : vi.fn((cmd: GetCommandInput) => E.succeed({Item: {} as User.Encoded | undefined})),
  put   : vi.fn((cmd: PutCommandInput) => E.void),
  delete: vi.fn((cmd: DeleteCommandInput) => E.void),
  query : vi.fn((cmd: QueryCommandInput) => E.void),
  scan  : vi.fn((cmd: ScanCommandInput) => E.void),
};

const mockDb = L.succeed(DeepFryerDB, DeepFryerDB.make(mock as any));

it.effect('when registering a new user', E.fn(function* () {
  mock.get.mockReturnValueOnce(E.succeed({Item: undefined}));

  const actual = yield* pipe(
    UserRegistry.register({
      caller_id: 'user',
      payload  : {
        timezone: DateTime.zoneUnsafeMakeNamed('America/Chicago'),
      },
    }),
    E.provide(mockDb),
  );

  expect(actual).toMatchSnapshot();
  expect(mock.get.mock.calls[0][0].Key).toMatchSnapshot();
  expect(mock.put.mock.calls[0][0].Item).toMatchSnapshot();
}));

it.effect('when re-registering a user', E.fn(function* () {
  mock.get.mockReturnValueOnce(E.succeed({
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
    E.provide(mockDb),
  );

  expect(actual).toMatchSnapshot();
  expect(mock.get.mock.calls[0][0].Key).toMatchSnapshot();
  expect(mock.put.mock.calls[0][0].Item).toMatchSnapshot();
}));

it.effect('when admin registering a new user', E.fn(function* () {
  mock.get
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
    E.provide(mockDb),
  );

  expect(actual).toMatchSnapshot();
  expect(mock.get.mock.calls[0][0].Key).toMatchSnapshot();
  expect(mock.put.mock.calls[0][0].Item).toMatchSnapshot();
}));

it.effect('when admin registering a current user', E.fn(function* () {
  mock.get
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
    E.provide(mockDb),
    E.catchAll((cause) => E.succeed(cause)),
  );

  expect(actual).toMatchSnapshot();
  expect(mock.get.mock.calls[0][0].Key).toMatchSnapshot();
  expect(mock.put).toBeCalledTimes(0);
}));
