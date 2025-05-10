import {ServerClanRegistry} from '#src/data/index.ts';
import {mockCoc, mockCocLayer} from '#unit/data/mock-coc.ts';
import {TestDataServer, TestDataServerClanElderVerified, TestDataServerClanLeaderVerified, TestDataUser, TestDataUserPlayer} from '#unit/data/mock-db.testdata.ts';
import {mockDb, mockDbLayer} from '#unit/data/mock-db.ts';
import {it} from '@effect/vitest';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

it.effect('when registering a new server clan', E.fn(function* () {
  mockDb.get
    .mockReturnValueOnce(E.succeed({Item: TestDataServer}));

  mockDb.query
    .mockReturnValueOnce(E.succeed({Items: [TestDataUser, TestDataUserPlayer]}))
    .mockReturnValueOnce(E.succeed({Items: []}));

  mockCoc.getClan
    .mockReturnValueOnce(E.succeed({
      tag        : 'clan',
      name       : 'ClanName',
      description: 'ClanDescription',
      members    : [{
        tag : 'player',
        role: 'leader',
      }],
    }));

  const actual = yield* pipe(
    ServerClanRegistry.register({
      caller_id   : 'user',
      caller_roles: ['admin'],
      guild_id    : 'guild',
      clan_tag    : 'clan',
      payload     : {
        countdown: 'countdown',
      },
    }),
    E.provide(mockDbLayer),
    E.provide(mockCocLayer),
  );

  expect(actual).toMatchInlineSnapshot(`
    {
      "description": "Success",
    }
  `);
  expect(mockCoc.getClan).toBeCalled();
  expect(mockCoc.getClan.mock.calls[0][0]).toMatchSnapshot();
  expect(mockDb.get).toBeCalled();
  expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
  expect(mockDb.query).toBeCalled();
  expect(mockDb.query.mock.calls[0][0].KeyConditionExpression).toMatchSnapshot();
  expect(mockDb.query.mock.calls[1][0].KeyConditionExpression).toMatchSnapshot();
  expect(mockDb.put).toBeCalled();
  expect(mockDb.put.mock.calls[0][0].Item).toMatchSnapshot();
  expect(mockDb.delete).not.toBeCalled();
}));

describe('given caller user is not registered', () => {
  it.effect('when registering', E.fn(function* () {
    mockDb.get
      .mockReturnValueOnce(E.succeed({Item: TestDataServer}));

    mockDb.query
      .mockReturnValueOnce(E.succeed({Items: [TestDataUserPlayer]}))
      .mockReturnValueOnce(E.succeed({Items: []}));

    mockCoc.getClan
      .mockReturnValueOnce(E.succeed({
        tag        : 'clan',
        name       : 'ClanName',
        description: 'ClanDescription',
        members    : [{
          tag : 'player',
          role: 'leader',
        }],
      }));

    const actual = yield* pipe(
      ServerClanRegistry.register({
        caller_id   : 'user',
        caller_roles: ['admin'],
        guild_id    : 'guild',
        clan_tag    : 'clan',
        payload     : {
          countdown: 'countdown',
        },
      }),
      E.provide(mockDbLayer),
      E.provide(mockCocLayer),
      E.catchAll((cause) => E.succeed(cause)),
    );

    expect(actual).toMatchInlineSnapshot(`[RegistryAdminError: Your Discord user account is not registered.]`);
    expect(mockCoc.getClan).not.toBeCalled();
    expect(mockDb.get).toBeCalled();
    expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
    expect(mockDb.query).toBeCalledTimes(1);
    expect(mockDb.query.mock.calls[0][0].KeyConditionExpression).toMatchSnapshot();
    expect(mockDb.put).not.toBeCalled();
    expect(mockDb.delete).not.toBeCalled();
  }));
});

describe('given caller server is not registered', () => {
  it.effect('when registering', E.fn(function* () {
    const actual = yield* pipe(
      ServerClanRegistry.register({
        caller_id   : 'user',
        caller_roles: ['admin'],
        guild_id    : 'guild',
        clan_tag    : 'clan',
        payload     : {
          countdown: 'countdown',
        },
      }),
      E.provide(mockDbLayer),
      E.provide(mockCocLayer),
      E.catchAll((cause) => E.succeed(cause)),
    );
  }));
});

describe('given caller is not admin', () => {
  it.effect('when registering', E.fn(function* () {
    mockDb.get
      .mockReturnValueOnce(E.succeed({Item: TestDataServer}));

    mockDb.query
      .mockReturnValueOnce(E.succeed({Items: [TestDataUser, TestDataUserPlayer]}))
      .mockReturnValueOnce(E.succeed({Items: []}));

    mockCoc.getClan
      .mockReturnValueOnce(E.succeed({
        tag        : 'clan',
        name       : 'ClanName',
        description: 'ClanDescription',
        members    : [{
          tag : 'player',
          role: 'leader',
        }],
      }));

    const actual = yield* pipe(
      ServerClanRegistry.register({
        caller_id   : 'user',
        caller_roles: [],
        guild_id    : 'guild',
        clan_tag    : 'clan',
        payload     : {
          countdown: 'countdown',
        },
      }),
      E.provide(mockDbLayer),
      E.provide(mockCocLayer),
      E.catchAll((cause) => E.succeed(cause)),
    );

    expect(actual).toMatchInlineSnapshot(`[RegistryAdminError: You are not authorized to register a clan for this server.]`);
    expect(mockCoc.getClan).not.toBeCalled();
    expect(mockDb.get).toBeCalled();
    expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
    expect(mockDb.query).not.toBeCalled();
    expect(mockDb.put).not.toBeCalled();
    expect(mockDb.delete).not.toBeCalled();
  }));
});

describe('given caller has no verified accounts in clan', () => {
  it.effect('when registering', E.fn(function* () {
    mockDb.get
      .mockReturnValueOnce(E.succeed({Item: TestDataServer}));

    mockDb.query
      .mockReturnValueOnce(E.succeed({Items: [TestDataUser, TestDataUserPlayer]}))
      .mockReturnValueOnce(E.succeed({Items: []}));

    mockCoc.getClan
      .mockReturnValueOnce(E.succeed({
        tag        : 'clan',
        name       : 'ClanName',
        description: 'ClanDescription',
        members    : [],
      }));

    const actual = yield* pipe(
      ServerClanRegistry.register({
        caller_id   : 'user',
        caller_roles: ['admin'],
        guild_id    : 'guild',
        clan_tag    : 'clan',
        payload     : {
          countdown: 'countdown',
        },
      }),
      E.provide(mockDbLayer),
      E.provide(mockCocLayer),
      E.catchAll((cause) => E.succeed(cause)),
    );

    expect(actual).toMatchInlineSnapshot(`[RegistryAdminError: Your Discord account has no verified player links (elder or above) in this clan.]`);
    expect(mockCoc.getClan).toBeCalledTimes(1);
    expect(mockCoc.getClan.mock.calls[0][0]).toMatchSnapshot();
    expect(mockDb.get).toBeCalledTimes(1);
    expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
    expect(mockDb.query).toBeCalledTimes(2);
    expect(mockDb.query.mock.calls[0][0].KeyConditionExpression).toMatchSnapshot();
    expect(mockDb.query.mock.calls[1][0].KeyConditionExpression).toMatchSnapshot();
    expect(mockDb.put).not.toBeCalled();
    expect(mockDb.delete).not.toBeCalled();
  }));
});

describe('given server clan is already registered with elder verification to a different server', () => {
  it.effect('when registering', E.fn(function* () {
    mockDb.get
      .mockReturnValueOnce(E.succeed({Item: TestDataServer}));

    mockDb.query
      .mockReturnValueOnce(E.succeed({Items: [TestDataUser, TestDataUserPlayer]}))
      .mockReturnValueOnce(E.succeed({Items: [TestDataServerClanElderVerified]}));

    mockCoc.getClan
      .mockReturnValueOnce(E.succeed({
        tag        : 'clan',
        name       : 'ClanName',
        description: 'ClanDescription',
        members    : [{
          tag : 'player',
          role: 'leader',
        }],
      }));

    const actual = yield* pipe(
      ServerClanRegistry.register({
        caller_id   : 'user',
        caller_roles: ['admin'],
        guild_id    : 'guild',
        clan_tag    : 'clan',
        payload     : {
          countdown: 'countdown',
        },
      }),
      E.provide(mockDbLayer),
      E.provide(mockCocLayer),
    );

    expect(actual).toMatchInlineSnapshot(`
      {
        "description": "Success",
      }
    `);
    expect(mockCoc.getClan).toBeCalled();
    expect(mockCoc.getClan.mock.calls[0][0]).toMatchSnapshot();
    expect(mockDb.get).toBeCalled();
    expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
    expect(mockDb.query).toBeCalled();
    expect(mockDb.query.mock.calls[0][0].KeyConditionExpression).toMatchSnapshot();
    expect(mockDb.query.mock.calls[1][0].KeyConditionExpression).toMatchSnapshot();
    expect(mockDb.put).toBeCalled();
    expect(mockDb.put.mock.calls[0][0].Item).toMatchSnapshot();
    expect(mockDb.delete).toBeCalled();
    expect(mockDb.delete.mock.calls[0][0].Key).toMatchSnapshot();
  }));
});

describe('given server clan is already leader verified', () => {
  it.effect('when registering', E.fn(function* () {
    mockDb.get
      .mockReturnValueOnce(E.succeed({Item: TestDataServer}));

    mockDb.query
      .mockReturnValueOnce(E.succeed({Items: [TestDataUser, TestDataUserPlayer]}))
      .mockReturnValueOnce(E.succeed({Items: [TestDataServerClanLeaderVerified]}));

    mockCoc.getClan
      .mockReturnValueOnce(E.succeed({
        tag        : 'clan',
        name       : 'ClanName',
        description: 'ClanDescription',
        members    : [{
          tag : 'player',
          role: 'elder',
        }],
      }));

    const actual = yield* pipe(
      ServerClanRegistry.register({
        caller_id   : 'user',
        caller_roles: ['admin'],
        guild_id    : 'guild',
        clan_tag    : 'clan',
        payload     : {
          countdown: 'countdown',
        },
      }),
      E.provide(mockDbLayer),
      E.provide(mockCocLayer),
      E.catchAll((cause) => E.succeed(cause)),
    );

    expect(actual).toMatchInlineSnapshot(`[RegistryAdminError: Your member player links cannot override the current verification level of this clan.]`);
    expect(mockCoc.getClan).toBeCalled();
    expect(mockCoc.getClan.mock.calls[0][0]).toMatchSnapshot();
    expect(mockDb.get).toBeCalled();
    expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
    expect(mockDb.query).toBeCalled();
    expect(mockDb.query.mock.calls[0][0].KeyConditionExpression).toMatchSnapshot();
    expect(mockDb.query.mock.calls[1][0].KeyConditionExpression).toMatchSnapshot();
    expect(mockDb.put).not.toBeCalled();
    expect(mockDb.delete).not.toBeCalled();
  }));
});
