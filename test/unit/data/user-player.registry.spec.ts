import {DataTag} from '#src/data/constants/index.ts';
import {UserPlayerRegistry, UserRegistry} from '#src/data/index.ts';
import {mockCoc, mockCocLayer} from '#unit/data/mock-coc.ts';
import {mockDb, mockDbLayer} from '#unit/data/mock-db.ts';
import {it, describe} from '@effect/vitest';
import * as DateTime from 'effect/DateTime';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

describe('given caller user is not registered', () => {
  it.effect('when registering user player', E.fn(function* () {
    mockDb.get
      .mockReturnValueOnce(E.succeed({Item: undefined}));

    const actual = yield* pipe(
      UserPlayerRegistry.register({
        caller_id : 'user',
        player_tag: 'player',
        api_token : 'api_token',
        payload   : {
          account_type: 'main',
        },
      }),
      E.provide(mockDbLayer),
      E.provide(mockCocLayer),
      E.catchAll((cause) => E.succeed(cause)),
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
      .mockReturnValueOnce(E.succeed({
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

    mockDb.query
      .mockReturnValueOnce(E.succeed({Items: []}));

    mockCoc.verifyPlayerToken
      .mockReturnValueOnce(E.succeed(true));

    mockCoc.getPlayer
      .mockReturnValueOnce(E.succeed({
        name: 'PlayerName',
      }));

    const actual = yield* pipe(
      UserPlayerRegistry.register({
        caller_id : 'user',
        player_tag: 'player',
        api_token : 'api_token',
        payload   : {
          account_type: 'main',
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
        .mockReturnValueOnce(E.succeed({
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

      mockDb.query
        .mockReturnValueOnce(E.succeed({Items: []}));

      mockCoc.verifyPlayerToken.mockReturnValueOnce(E.succeed(false));

      const actual = yield* pipe(
        UserPlayerRegistry.register({
          caller_id : 'user',
          player_tag: 'player',
          api_token : 'api_token',
          payload   : {
            account_type: 'main',
          },
        }),
        E.catchAll((cause) => E.succeed(cause)),
        E.provide(mockDbLayer),
        E.provide(mockCocLayer),
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
      .mockReturnValueOnce(E.succeed({
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

    mockDb.query
      .mockReturnValueOnce(E.succeed({Items: [{
          _tag          : 'UserPlayer',
          account_type  : 'main',
          created       : '1970-01-01T00:00:00.000Z',
          gsi_player_tag: 'p-player',
          gsi_user_id   : 'u-user2',
          name          : 'PlayerName',
          pk            : 'u-user2',
          sk            : 'p-player',
          updated       : '1970-01-01T00:00:00.000Z',
          verification  : 2,
          version       : 0,
        }]}));

    mockCoc.verifyPlayerToken
      .mockReturnValueOnce(E.succeed(true));

    mockCoc.getPlayer
      .mockReturnValueOnce(E.succeed({
        name: 'PlayerName',
      }));

    const actual = yield* pipe(
      UserPlayerRegistry.register({
        caller_id : 'user',
        player_tag: 'player',
        api_token : 'api_token',
        payload   : {
          account_type: 'main',
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
      .mockReturnValueOnce(E.succeed({
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
      }))
      .mockReturnValueOnce(E.succeed({
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

    mockDb.query
      .mockReturnValueOnce(E.succeed({Items: [{
          _tag          : 'UserPlayer',
          account_type  : 'main',
          created       : '1970-01-01T00:00:00.000Z',
          gsi_player_tag: 'p-player',
          gsi_user_id   : 'u-user2',
          name          : 'PlayerName',
          pk            : 'u-user2',
          sk            : 'p-player',
          updated       : '1970-01-01T00:00:00.000Z',
          verification  : 1,
          version       : 0,
        }]}));

    mockCoc.verifyPlayerToken
      .mockReturnValueOnce(E.succeed(true));

    mockCoc.getPlayer
      .mockReturnValueOnce(E.succeed({
        name: 'PlayerName',
      }));

    const actual = yield* pipe(
      UserPlayerRegistry.register({
        guild_id    : 'guild',
        caller_id   : 'user',
        player_tag  : 'player',
        caller_roles: ['admin'],
        target_id   : 'user2',
        payload     : {
          account_type: 'main',
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
        .mockReturnValueOnce(E.succeed({
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
        }))
        .mockReturnValueOnce(E.succeed({
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

      mockDb.query
        .mockReturnValueOnce(E.succeed({Items: [{
            _tag          : 'UserPlayer',
            account_type  : 'main',
            created       : '1970-01-01T00:00:00.000Z',
            gsi_player_tag: 'p-player',
            gsi_user_id   : 'u-user2',
            name          : 'PlayerName',
            pk            : 'u-user2',
            sk            : 'p-player',
            updated       : '1970-01-01T00:00:00.000Z',
            verification  : 2,
            version       : 0,
          }]}));

      mockCoc.verifyPlayerToken
        .mockReturnValueOnce(E.succeed(true));

      mockCoc.getPlayer
        .mockReturnValueOnce(E.succeed({
          name: 'PlayerName',
        }));

      const actual = yield* pipe(
        UserPlayerRegistry.register({
          guild_id    : 'guild',
          caller_id   : 'user',
          player_tag  : 'player',
          caller_roles: ['admin'],
          target_id   : 'user2',
          payload     : {
            account_type: 'main',
          },
        }),
        E.provide(mockDbLayer),
        E.provide(mockCocLayer),
        E.catchAll((cause) => E.succeed(cause)),
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
        .mockReturnValueOnce(E.succeed({
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
        }))
        .mockReturnValueOnce(E.succeed({
          Item: undefined,
        }));

      const actual = yield* pipe(
        UserPlayerRegistry.register({
          guild_id    : 'guild',
          caller_id   : 'user',
          player_tag  : 'player',
          caller_roles: ['admin'],
          target_id   : 'user2',
          payload     : {
            account_type: 'main',
          },
        }),
        E.provide(mockDbLayer),
        E.provide(mockCocLayer),
        E.catchAll((cause) => E.succeed(cause)),
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
        .mockReturnValueOnce(E.succeed({
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
        }))
        .mockReturnValueOnce(E.succeed({
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
        UserPlayerRegistry.register({
          guild_id    : 'guild',
          caller_id   : 'user',
          player_tag  : 'player',
          caller_roles: [],
          target_id   : 'user2',
          payload     : {
            account_type: 'main',
          },
        }),
        E.provide(mockDbLayer),
        E.provide(mockCocLayer),
        E.catchAll((cause) => E.succeed(cause)),
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
