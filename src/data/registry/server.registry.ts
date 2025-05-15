import {RegistryAdminError, RegistryUserError} from '#src/data/arch/util.ts';
import * as Server from '#src/data/items/server.ts';
import {pipe} from 'effect/Function';
import * as E from 'effect/Effect';

export const get = (guild_id: string) =>
  pipe(
    Server.get({
      Key           : {pk: guild_id, sk: 'now'},
      ConsistentRead: true,
    }),
    E.map((res) => res.Item),
  );

export const getAssert = (guild_id: string) =>
  pipe(
    Server.get({
      Key           : {pk: guild_id, sk: 'now'},
      ConsistentRead: true,
    }),
    E.flatMap((res) => E.fromNullable(res.Item)),
  );

type RegisterParams = {
  caller_id   : string;
  caller_roles: string[];
  guild_id    : string;
  payload: {
    admin: string;
  };
};

export const register = E.fn('ServerRegistry.register')(function* (params: RegisterParams) {
  if (!params.caller_roles.includes(params.payload.admin)) {
    return yield* new RegistryUserError({
      message: 'You do not have the given admin role.',
    });
  }

  const server = yield* get(params.guild_id);

  if (!server) {
    yield* Server.put({
      Item: Server.make({
        pk : params.guild_id,
        sk : 'now',
        pkp: params.guild_id,
        ...params.payload,
      }),
    });

    return {
      description: 'Success',
    };
  }

  if (!params.caller_roles.includes(server.admin)) {
    return yield* new RegistryAdminError({
      message: 'You do not have the current admin role to update this server registration.',
    });
  }

  yield* Server.put({
    Item: Server.make({
      ...server,
      pk: params.guild_id,
      sk: 'now',
      ...params.payload,
    }),
  });

  return {
    description: 'Success',
  };
});
