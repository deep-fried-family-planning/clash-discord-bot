import {TestDataUser, TestDataUser1, TestDataUser2} from '#unit/.mock/mock-db.testdata.ts';
import {mockDb, mockDbLayer} from '#unit/.mock/mock-db.ts';
import {it} from '@effect/vitest';
import {DateTimes, GetRandomValues} from '@typed/id';
import * as DateTime from 'effect/DateTime';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as UserRegistry from '#src/data-registry/user.registry.ts';

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
    E.provide([GetRandomValues.layer(() => E.succeed(new Uint8Array([]))), DateTimes.Fixed(new Date(0))]),
  );

  expect(actual).toMatchSnapshot();
  expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
  expect(mockDb.put.mock.calls[0][0].Item).toMatchSnapshot();
}));

it.effect('when re-registering a user', E.fn(function* () {
  mockDb.get.mockReturnValueOnce(E.succeed({Item: TestDataUser}));

  const actual = yield* pipe(
    UserRegistry.register({
      caller_id: 'user',
      payload  : {
        timezone: DateTime.zoneUnsafeMakeNamed('America/Chicago'),
      },
    }),
    E.provide(mockDbLayer),
    E.provide([GetRandomValues.layer(() => E.succeed(new Uint8Array([]))), DateTimes.Fixed(new Date(0))]),
  );

  expect(actual).toMatchSnapshot();
  expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
  expect(mockDb.put).not.toBeCalled();
}));

it.effect('when admin registering a new user', E.fn(function* () {
  mockDb.get
    .mockReturnValueOnce(E.succeed({Item: TestDataUser1}))
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
    E.provide([GetRandomValues.layer(() => E.succeed(new Uint8Array([]))), DateTimes.Fixed(new Date(0))]),
  );

  expect(actual).toMatchSnapshot();
  expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
  expect(mockDb.put.mock.calls[0][0].Item).toMatchSnapshot();
}));

it.effect('when admin registering a current user', E.fn(function* () {
  mockDb.get
    .mockReturnValueOnce(E.succeed({Item: TestDataUser1}))
    .mockReturnValueOnce(E.succeed({Item: TestDataUser2}));

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
    E.provide([GetRandomValues.layer(() => E.succeed(new Uint8Array([]))), DateTimes.Fixed(new Date(0))]),
  );

  expect(actual).toMatchSnapshot();
  expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
  expect(mockDb.put).toBeCalledTimes(0);
}));
