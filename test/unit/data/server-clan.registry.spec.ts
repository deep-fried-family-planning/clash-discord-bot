import {DataTag} from '#src/data/constants/index.ts';
import {ServerClanRegistry, UserPlayerRegistry, UserRegistry} from '#src/data/index.ts';
import {mockCoc, mockCocLayer} from '#unit/data/mock-coc.ts';
import {mockDb, mockDbLayer} from '#unit/data/mock-db.ts';
import {it, describe} from '@effect/vitest';
import * as DateTime from 'effect/DateTime';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

describe.skip('given caller user is not registered', () => {
  it.effect('when registering server clan', E.fn(function* () {
    mockDb.get
      .mockReturnValueOnce(E.succeed({Item: undefined}));

    const actual = yield* pipe(
      ServerClanRegistry.register({
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

    expect(actual).toMatchInlineSnapshot(`
      [ParseError: { readonly pk: (startsWith("s-") <-> string); readonly sk: "now" }
      └─ ["pk"]
         └─ (startsWith("s-") <-> string)
            └─ Type side transformation failure
               └─ Expected string, actual undefined]
    `);
    expect(mockCoc.verifyPlayerToken).not.toBeCalled();
    expect(mockCoc.getPlayer).not.toBeCalled();
    expect(mockDb.get.mock.calls[0][0].Key).toMatchSnapshot();
    expect(mockDb.query).not.toBeCalled();
    expect(mockDb.put).not.toBeCalled();
    expect(mockDb.delete).not.toBeCalled();
  }));
});

describe('given new server clan registration', () => {
  it.effect('when registering', E.fn(function* () {

  }));

  describe('given invalid api_token', () => {
    it.effect('when registering', E.fn(function* () {

    }));
  });
});

describe('given server clan is already registered', () => {
  it.effect('when registering', E.fn(function* () {

  }));
});

describe('given caller is attempting admin registration', () => {
  it.effect('when admin registering user player', E.fn(function* () {

  }));

  describe('given player is already registered at higher verification level', () => {
    it.effect('when admin registering user player', E.fn(function* () {

    }));
  });

  describe('given caller server is not registered', () => {
    it.effect('when admin registering user player', E.fn(function* () {

    }));
  });

  describe('given caller is not a server admin', () => {
    it.effect('when admin registering user player', E.fn(function* () {

    }));
  });
});
