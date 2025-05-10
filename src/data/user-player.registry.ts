import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {RegistryAdminError, RegistryDefect, RegistryUserError} from '#src/data/arch/util.ts';
import {PlayerVerification} from '#src/data/constants/index.ts';
import * as ServerRegistry from '#src/data/server.registry.ts';
import * as UserPlayerGsi from '#src/data/user-player.gsi.ts';
import * as UserPlayer from '#src/data/user-player.ts';
import * as UserRegistry from '#src/data/user.registry.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

export const get = (user_id: string, player_tag: string) =>
  pipe(
    UserPlayer.getItem({
      Key           : {pk: user_id, sk: player_tag},
      ConsistentRead: true,
    }),
    E.map((res) => res.Item),
  );

export const getAssert = (user_id: string, player_tag: string) =>
  pipe(
    UserPlayer.getItem({
      Key           : {pk: user_id, sk: player_tag},
      ConsistentRead: true,
    }),
    E.flatMap((res) => E.fromNullable(res.Item)),
  );

type RegisterParams = {
  guild_id?    : string;
  caller_id    : string;
  caller_roles?: string[];
  player_tag   : string;
  api_token?   : string;
  target_id?   : string;
  payload: {
    account_type: string;
  };
};

export const register = E.fn('UserPlayerRegistry.register')(function* (p: RegisterParams) {
  yield* UserRegistry.getAssert(p.caller_id);

  if (!p.api_token) {
    if (!p.target_id) {
      return yield* new RegistryAdminError({
        message: 'You must provide a target user id to admin register a player account.',
      });
    }
    if (!p.guild_id) {
      return yield* new RegistryDefect({});
    }
    if (!p.caller_roles) {
      return yield* new RegistryDefect({});
    }

    const server = yield* ServerRegistry.getAssert(p.guild_id);

    if (!p.caller_roles.includes(server.admin)) {
      return yield* new RegistryAdminError({
        message: 'You are not authorized to register a player account for this server.',
      });
    }

    const gsi = yield* UserPlayerGsi.query({
      KeyConditionExpression: {
        gsi_player_tag: p.player_tag,
      },
    });

    if (gsi.Items.length > 1) {
      return yield* new RegistryDefect({});
    }

    const player = yield* ClashOfClans.getPlayer(p.player_tag);

    if (gsi.Items.length === 1) {
      const current = gsi.Items[0];

      if (current.verification >= PlayerVerification.token) {
        return yield* new RegistryAdminError({
          message: 'You are not authorized to update the registration of this player account.',
        });
      }

      yield* UserPlayer.deleteItem({
        Key: {
          pk: current.pk,
          sk: current.sk,
        },
      });

      yield* UserPlayer.putItem({
        Item: UserPlayer.item({
          pk            : p.target_id,
          sk            : p.player_tag,
          gsi_user_id   : p.target_id,
          gsi_player_tag: p.player_tag,
          name          : player.name,
          ...p.payload,
          verification  : PlayerVerification.admin,
        }),
      });

      return {
        description: 'Success',
      };
    }

    yield* UserPlayer.putItem({
      Item: UserPlayer.item({
        pk            : p.target_id,
        sk            : p.player_tag,
        gsi_user_id   : p.target_id,
        gsi_player_tag: p.player_tag,
        name          : player.name,
        ...p.payload,
        verification  : PlayerVerification.admin,
      }),
    });

    return {
      description: 'Success',
    };
  }

  const isValid = yield* ClashOfClans.verifyPlayerToken(p.player_tag, p.api_token);

  if (!isValid) {
    return yield* new RegistryUserError({
      message: 'Invalid player token.',
    });
  }

  const gsi = yield* UserPlayerGsi.query({
    KeyConditionExpression: {gsi_player_tag: p.player_tag},
  });

  if (gsi.Items.length > 1) {
    return yield* new RegistryDefect({});
  }

  const player = yield* ClashOfClans.getPlayer(p.player_tag);

  if (gsi.Items.length === 1) {
    const current = gsi.Items[0];

    if (current.pk !== p.caller_id) {
      yield* UserPlayer.deleteItem({
        Key: {
          pk: current.pk,
          sk: current.sk,
        },
      });

      yield* UserPlayer.putItem({
        Item: UserPlayer.item({
          ...current,
          pk            : p.caller_id,
          sk            : p.player_tag,
          gsi_user_id   : p.caller_id,
          gsi_player_tag: p.player_tag,
          name          : player.name,
          ...p.payload,
          verification  : PlayerVerification.token,
        }),
      });

      return {
        description: 'Success',
      };
    }

    yield* UserPlayer.putItem({
      Item: UserPlayer.item({
        ...current,
        name        : player.name,
        ...p.payload,
        verification: PlayerVerification.token,
      }),
    });

    return {
      description: 'Success',
    };
  }

  yield* UserPlayer.putItem({
    Item: UserPlayer.item({
      pk            : p.caller_id,
      sk            : p.player_tag,
      gsi_user_id   : p.caller_id,
      gsi_player_tag: p.player_tag,
      name          : player.name,
      ...p.payload,
      verification  : PlayerVerification.token,
    }),
  });

  return {
    description: 'Success',
  };
});
