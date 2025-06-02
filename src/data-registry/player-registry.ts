import {ClashOfClans} from '#src/service/ClashOfClans.ts';
import {RegistryAdminError, RegistryDefect, RegistryUserError} from '#src/data/util.ts';
import {PlayerVerification} from '#src/data/constants/index.ts';
import * as ServerRegistry from '#src/data-registry/server-registry.ts';
import * as GSI2 from '#src/data/gsi/gsi2.ts';
import * as Player from '#src/data/user/player.ts';
import * as UserRegistry from '#src/data-registry/user-registry.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

export const get = (user_id: string, player_tag: string) =>
  pipe(
    Player.read({
      Key           : {pk: user_id, sk: player_tag},
      ConsistentRead: true,
    }),
    E.map((res) => res.Item),
  );

export const getAssert = (user_id: string, player_tag: string) =>
  pipe(
    Player.read({
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
  api_token?   : string | undefined;
  target_id?   : string | undefined;
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

    const gsi = yield* GSI2.queryPlayer(p.player_tag);

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

      yield* Player.del({
        Key: {
          pk: current.pk,
          sk: current.sk,
        },
      });

      yield* Player.create({
        Item: Player.make({
          pk          : p.target_id,
          sk          : p.player_tag,
          pk2         : p.player_tag,
          sk2         : p.target_id,
          name        : player.name,
          ...p.payload,
          verification: PlayerVerification.admin,
        }),
      });

      return {
        description: 'Success',
      };
    }

    yield* Player.create({
      Item: Player.make({
        pk          : p.target_id,
        sk          : p.player_tag,
        pk2         : p.player_tag,
        sk2         : p.target_id,
        name        : player.name,
        ...p.payload,
        verification: PlayerVerification.admin,
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

  const gsi = yield* GSI2.queryPlayer(p.player_tag);

  if (gsi.Items.length > 1) {
    return yield* new RegistryDefect({});
  }

  const player = yield* ClashOfClans.getPlayer(p.player_tag);

  if (gsi.Items.length === 1) {
    const current = gsi.Items[0];

    if (current.pk !== p.caller_id) {
      yield* Player.del({
        Key: {
          pk: current.pk,
          sk: current.sk,
        },
      });

      yield* Player.create({
        Item: Player.make({
          ...current,
          pk          : p.caller_id,
          sk          : p.player_tag,
          pk2         : p.player_tag,
          sk2         : p.caller_id,
          name        : player.name,
          ...p.payload,
          verification: PlayerVerification.token,
        }),
      });

      return {
        description: 'Success',
      };
    }

    yield* Player.create({
      Item: Player.make({
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

  yield* Player.create({
    Item: Player.make({
      pk          : p.caller_id,
      sk          : p.player_tag,
      pk2         : p.player_tag,
      sk2         : p.caller_id,
      name        : player.name,
      ...p.payload,
      verification: PlayerVerification.token,
    }),
  });

  return {
    description: 'Success',
  };
});
