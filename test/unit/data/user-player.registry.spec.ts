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

    expect(actual).toMatchSnapshot();
    expect(mockCoc.verifyPlayerToken).not.toBeCalled();
    expect(mockCoc.getPlayer).not.toBeCalled();
    expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
    expect(mockDb.query).not.toBeCalled();
    expect(mockDb.put).not.toBeCalled();
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

    expect(actual).toMatchSnapshot();
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

      expect(actual).toMatchSnapshot();
      expect(mockCoc.verifyPlayerToken).toBeCalled();
      expect(mockCoc.verifyPlayerToken.mock.calls[0]).toMatchSnapshot();
      expect(mockCoc.getPlayer).not.toBeCalled();
      expect(mockDb.get).toBeCalled();
      expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
      expect(mockDb.query).not.toBeCalled();
      expect(mockDb.put).not.toBeCalled();
    }));
  });
});

describe('given user player is already registered', () => {

});

describe('given caller is attempting admin registration', () => {

});
