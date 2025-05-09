import {RegistryAdminError, RegistryDefect, RegistryFailure} from '#src/data/arch/util.ts';
import * as User from '#src/data/user.ts';
import * as UserPlayer from '#src/data/user-player.ts';
import * as UserPlayerGsi from '#src/data/user-player.gsi.ts';
import {pipe} from 'effect/Function';
import * as E from 'effect/Effect';
import * as UserRegistry from '#src/data/user.registry.ts';

export const get = (user_id: string, player_tag: string) =>
  pipe(
    UserPlayer.get({
      Key           : {pk: user_id, sk: player_tag},
      ConsistentRead: true,
    }),
    E.map((res) => res.Item),
  );

export const getAssert = (user_id: string, player_tag: string) =>
  pipe(
    UserPlayer.get({
      Key           : {pk: user_id, sk: player_tag},
      ConsistentRead: true,
    }),
    E.flatMap((res) => E.fromNullable(res.Item)),
  );

type RegisterParams = {
  caller_id : string;
  player_tag: string;
  api_token?: string;
  target_id?: string;
  payload: {
    account_type: string;
  };
};

export const register = E.fn('UserPlayerRegistry.register')(function* (p: RegisterParams) {
  const caller = yield* UserRegistry.getAssert(p.caller_id);

  const gsi = yield* UserPlayerGsi.query({
    IndexName             : UserPlayerGsi.Index,
    KeyConditionExpression: {gsi_player_tag: p.player_tag},
  });

  if (gsi.Items.length > 1) {
    return yield* new RegistryDefect({});
  }

  // todo
  if (gsi.Items.length === 1) {
    const current = gsi.Items[0];

    return {
      description: 'Success',
    };
  }

  // todo
  return {
    description: 'Success',
  };
});
