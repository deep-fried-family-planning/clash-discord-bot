import * as UserPlayerRegistry from '#src/data-registry/user-player.registry.ts';
import {mockCoc, mockCocLayer} from '#unit/.mock/mock-coc.ts';
import {TestDataServer, TestDataUser, TestDataUserPlayer, TestDataUserPlayer2} from '#unit/.mock/mock-db.testdata.ts';
import {mockDb, mockDbLayer} from '#unit/.mock/mock-db.ts';
import {it} from '@effect/vitest';
import {DateTimes, GetRandomValues} from '@typed/id';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

describe('given caller user is not registered', () => {
  it.effect('when registering user player', E.fn(function* () {
    mockDb.get
      .mockReturnValueOnce(E.succeed({Item: undefined}));

    const actual = yield* pipe(
      UserPlayerRegistry.register({
        caller_id : 'user',
        player_tag: '#player',
        api_token : 'api_token',
        payload   : {
          account_type: 'main',
        },
      }),
      E.provide(mockDbLayer),
      E.provide(mockCocLayer),
      E.catchAll((cause) => E.succeed(cause)),
      E.provide([GetRandomValues.layer(() => E.succeed(new Uint8Array([]))), DateTimes.Fixed(new Date(0))]),
    );

    expect(actual).toMatchInlineSnapshot(`[NoSuchElementException]`);
    expect(mockCoc.verifyPlayerToken).not.toBeCalled();
    expect(mockCoc.getPlayer).not.toBeCalled();
    expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
    expect(mockDb.query).not.toBeCalled();
    expect(mockDb.put).not.toBeCalled();
    expect(mockDb.delete).not.toBeCalled();
  }));
});

describe('given new user player registration', () => {
  it.effect('when registering user player', E.fn(function* () {
    mockDb.get
      .mockReturnValueOnce(E.succeed({Item: TestDataUser}));

    mockDb.query
      .mockReturnValueOnce(E.succeed({Items: []}));

    mockCoc.verifyPlayerToken
      .mockReturnValueOnce(E.succeed(true));

    mockCoc.getPlayer
      .mockReturnValueOnce(E.succeed({name: 'PlayerName'}));

    const actual = yield* pipe(
      UserPlayerRegistry.register({
        caller_id : 'user',
        player_tag: '#player',
        api_token : 'api_token',
        payload   : {
          account_type: 'main',
        },
      }),
      E.provide(mockDbLayer),
      E.provide(mockCocLayer),
      E.provide([GetRandomValues.layer(() => E.succeed(new Uint8Array([]))), DateTimes.Fixed(new Date(0))]),
    );

    expect(actual).toMatchInlineSnapshot(`
      {
        "description": "Success",
      }
    `);
    expect(mockCoc.verifyPlayerToken).toBeCalled();
    expect(mockCoc.verifyPlayerToken.mock.calls[0]).toMatchSnapshot();
    expect(mockCoc.getPlayer).toBeCalled();
    expect(mockCoc.getPlayer.mock.calls[0]).toMatchSnapshot();
    expect(mockDb.get).toBeCalled();
    expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
    expect(mockDb.query).toBeCalled();
    expect(mockDb.query.mock.calls[0][0].KeyConditionExpression).toMatchSnapshot();
    expect(mockDb.put).toBeCalled();
    expect(mockDb.put.mock.calls[0][0].Item).toMatchSnapshot();
    expect(mockDb.delete).not.toBeCalled();
  }));

  describe('given invalid api_token', () => {
    it.effect('when caller user is not registered', E.fn(function* () {
      mockDb.get
        .mockReturnValueOnce(E.succeed({Item: TestDataUser}));

      mockDb.query
        .mockReturnValueOnce(E.succeed({Items: []}));

      mockCoc.verifyPlayerToken
        .mockReturnValueOnce(E.succeed(false));

      const actual = yield* pipe(
        UserPlayerRegistry.register({
          caller_id : 'user',
          player_tag: '#player',
          api_token : 'api_token',
          payload   : {
            account_type: 'main',
          },
        }),
        E.catchAll((cause) => E.succeed(cause)),
        E.provide(mockDbLayer),
        E.provide(mockCocLayer),
        E.provide([GetRandomValues.layer(() => E.succeed(new Uint8Array([]))), DateTimes.Fixed(new Date(0))]),
      );

      expect(actual).toMatchInlineSnapshot(`[RegistryUserError: Invalid player token.]`);
      expect(mockCoc.verifyPlayerToken).toBeCalled();
      expect(mockCoc.verifyPlayerToken.mock.calls[0]).toMatchSnapshot();
      expect(mockCoc.getPlayer).not.toBeCalled();
      expect(mockDb.get).toBeCalled();
      expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
      expect(mockDb.query).not.toBeCalled();
      expect(mockDb.put).not.toBeCalled();
      expect(mockDb.delete).not.toBeCalled();
    }));
  });
});

describe('given user player is already registered', () => {
  it.effect('when registering user player', E.fn(function* () {
    mockDb.get
      .mockReturnValueOnce(E.succeed({Item: TestDataUser}));

    mockDb.query
      .mockReturnValueOnce(E.succeed({Items: [TestDataUserPlayer]}));

    mockCoc.verifyPlayerToken
      .mockReturnValueOnce(E.succeed(true));

    mockCoc.getPlayer
      .mockReturnValueOnce(E.succeed({name: 'PlayerName'}));

    const actual = yield* pipe(
      UserPlayerRegistry.register({
        caller_id : 'user',
        player_tag: '#player',
        api_token : 'api_token',
        payload   : {
          account_type: 'main',
        },
      }),
      E.provide(mockDbLayer),
      E.provide(mockCocLayer),
      E.provide([GetRandomValues.layer(() => E.succeed(new Uint8Array([]))), DateTimes.Fixed(new Date(0))]),
    );

    expect(actual).toMatchInlineSnapshot(`
      {
        "description": "Success",
      }
    `);
    expect(mockCoc.verifyPlayerToken).toBeCalled();
    expect(mockCoc.verifyPlayerToken.mock.calls[0]).toMatchSnapshot();
    expect(mockCoc.getPlayer).toBeCalled();
    expect(mockCoc.getPlayer.mock.calls[0]).toMatchSnapshot();
    expect(mockDb.get).toBeCalled();
    expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
    expect(mockDb.query).toBeCalled();
    expect(mockDb.query.mock.calls[0][0].KeyConditionExpression).toMatchSnapshot();
    expect(mockDb.put).toBeCalled();
    expect(mockDb.put.mock.calls[0][0].Item).toMatchSnapshot();
    expect(mockDb.delete).toBeCalled();
    expect(mockDb.delete.mock.calls[0][0].Key).toMatchSnapshot();
  }));
});

describe('given caller is attempting admin registration', () => {
  it.effect('when admin registering user player', E.fn(function* () {
    mockDb.get
      .mockReturnValueOnce(E.succeed({Item: TestDataUser}))
      .mockReturnValueOnce(E.succeed({Item: TestDataServer}));

    mockDb.query
      .mockReturnValueOnce(E.succeed({Items: [TestDataUserPlayer2]}));

    mockCoc.verifyPlayerToken
      .mockReturnValueOnce(E.succeed(true));

    mockCoc.getPlayer
      .mockReturnValueOnce(E.succeed({name: 'PlayerName'}));

    const actual = yield* pipe(
      UserPlayerRegistry.register({
        guild_id    : 'guild',
        caller_id   : 'user',
        player_tag  : '#player',
        caller_roles: ['admin'],
        target_id   : 'user2',
        payload     : {
          account_type: 'main',
        },
      }),
      E.provide(mockDbLayer),
      E.provide(mockCocLayer),
      E.provide([GetRandomValues.layer(() => E.succeed(new Uint8Array([]))), DateTimes.Fixed(new Date(0))]),
    );

    expect(actual).toMatchInlineSnapshot(`
      {
        "description": "Success",
      }
    `);
    expect(mockCoc.verifyPlayerToken).not.toBeCalled();
    expect(mockCoc.getPlayer).toBeCalled();
    expect(mockCoc.getPlayer.mock.calls[0]).toMatchSnapshot();
    expect(mockDb.get).toBeCalled();
    expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
    expect(mockDb.get.mock.calls[1][0].Key).toMatchSnapshot();
    expect(mockDb.query).toBeCalled();
    expect(mockDb.query.mock.calls[0][0].KeyConditionExpression).toMatchSnapshot();
    expect(mockDb.put).toBeCalled();
    expect(mockDb.put.mock.calls[0][0].Item).toMatchSnapshot();
    expect(mockDb.delete).toBeCalled();
    expect(mockDb.delete.mock.calls[0][0].Key).toMatchSnapshot();
  }));

  describe('given player is already registered at higher verification level', () => {
    it.effect('when admin registering user player', E.fn(function* () {
      mockDb.get
        .mockReturnValueOnce(E.succeed({Item: TestDataUser}))
        .mockReturnValueOnce(E.succeed({Item: TestDataServer}));

      mockDb.query
        .mockReturnValueOnce(E.succeed({Items: [TestDataUserPlayer]}));

      mockCoc.verifyPlayerToken
        .mockReturnValueOnce(E.succeed(true));

      mockCoc.getPlayer
        .mockReturnValueOnce(E.succeed({name: 'PlayerName'}));

      const actual = yield* pipe(
        UserPlayerRegistry.register({
          guild_id    : 'guild',
          caller_id   : 'user',
          player_tag  : '#player',
          caller_roles: ['admin'],
          target_id   : 'user2',
          payload     : {
            account_type: 'main',
          },
        }),
        E.provide(mockDbLayer),
        E.provide(mockCocLayer),
        E.catchAll((cause) => E.succeed(cause)),
        E.provide([GetRandomValues.layer(() => E.succeed(new Uint8Array([]))), DateTimes.Fixed(new Date(0))]),
      );

      expect(actual).toMatchInlineSnapshot(`[RegistryAdminError: You are not authorized to update the registration of this player account.]`);
      expect(mockCoc.verifyPlayerToken).not.toBeCalled();
      expect(mockCoc.getPlayer).toBeCalled();
      expect(mockCoc.getPlayer.mock.calls[0]).toMatchSnapshot();
      expect(mockDb.get).toBeCalled();
      expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
      expect(mockDb.get.mock.calls[1][0].Key).toMatchSnapshot();
      expect(mockDb.query).toBeCalled();
      expect(mockDb.query.mock.calls[0][0].KeyConditionExpression).toMatchSnapshot();
      expect(mockDb.put).not.toBeCalled();
      expect(mockDb.delete).not.toBeCalled();
    }));
  });

  describe('given caller server is not registered', () => {
    it.effect('when admin registering user player', E.fn(function* () {
      mockDb.get
        .mockReturnValueOnce(E.succeed({Item: TestDataUser}))
        .mockReturnValueOnce(E.succeed({Item: undefined}));

      const actual = yield* pipe(
        UserPlayerRegistry.register({
          guild_id    : 'guild',
          caller_id   : 'user',
          player_tag  : '#player',
          caller_roles: ['admin'],
          target_id   : 'user2',
          payload     : {
            account_type: 'main',
          },
        }),
        E.provide(mockDbLayer),
        E.provide(mockCocLayer),
        E.catchAll((cause) => E.succeed(cause)),
        E.provide([GetRandomValues.layer(() => E.succeed(new Uint8Array([]))), DateTimes.Fixed(new Date(0))]),
      );

      expect(actual).toMatchInlineSnapshot(`[NoSuchElementException]`);
      expect(mockCoc.verifyPlayerToken).not.toBeCalled();
      expect(mockCoc.getPlayer).not.toBeCalled();
      expect(mockDb.get).toBeCalled();
      expect(mockDb.query).not.toBeCalled();
      expect(mockDb.put).not.toBeCalled();
      expect(mockDb.delete).not.toBeCalled();
    }));
  });

  describe('given caller is not a server admin', () => {
    it.effect('when admin registering user player', E.fn(function* () {
      mockDb.get
        .mockReturnValueOnce(E.succeed({Item: TestDataUser}))
        .mockReturnValueOnce(E.succeed({Item: TestDataServer}));

      const actual = yield* pipe(
        UserPlayerRegistry.register({
          guild_id    : 'guild',
          caller_id   : 'user',
          player_tag  : '#player',
          caller_roles: [],
          target_id   : 'user2',
          payload     : {
            account_type: 'main',
          },
        }),
        E.provide(mockDbLayer),
        E.provide(mockCocLayer),
        E.catchAll((cause) => E.succeed(cause)),
        E.provide([GetRandomValues.layer(() => E.succeed(new Uint8Array([]))), DateTimes.Fixed(new Date(0))]),
      );

      expect(actual).toMatchInlineSnapshot(`[RegistryAdminError: You are not authorized to register a player account for this server.]`);
      expect(mockCoc.verifyPlayerToken).not.toBeCalled();
      expect(mockCoc.getPlayer).not.toBeCalled();
      expect(mockDb.get).toBeCalled();
      expect(mockDb.query).not.toBeCalled();
      expect(mockDb.put).not.toBeCalled();
      expect(mockDb.delete).not.toBeCalled();
    }));
  });
});
