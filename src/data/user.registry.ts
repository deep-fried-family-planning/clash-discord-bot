import {RegistryAdminError} from '#src/data/arch/util-registry.ts';
import * as User from '#src/data/user.ts';
import type * as DateTime from 'effect/DateTime';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

export const get = (user_id: string) =>
  pipe(
    User.get({
      Key           : {pk: user_id, sk: 'now'},
      ConsistentRead: true,
    }),
    E.map((res) => res.Item),
  );

export const getAssert = (user_id: string) =>
  pipe(
    User.get({
      Key           : {pk: user_id, sk: 'now'},
      ConsistentRead: true,
    }),
    E.flatMap((res) => E.fromNullable(res.Item)),
  );

type RegisterParams = {
  caller_id : string;
  target_id?: string;
  payload: {
    timezone : DateTime.TimeZone;
    guild_id?: string;
  };
};

export const register = E.fn('UserRegistry.register')(function* (params: RegisterParams) {
  if (params.target_id === params.caller_id) {
    return yield* new RegistryAdminError({
      message: 'You cannot admin re-register yourself.',
    });
  }

  const caller = yield* get(params.caller_id);

  if (params.target_id) {
    if (!caller) {
      return yield* new RegistryAdminError({
        message: 'Caller is not registered.',
      });
    }

    const target = yield* get(params.target_id);

    if (target) {
      return yield* new RegistryAdminError({
        message: 'User already registered.',
      });
    }

    yield* User.put({
      Item: User.make({
        pk     : params.target_id,
        sk     : 'now',
        pkp    : params.target_id,
        servers: new Set(params.payload.guild_id ? [params.payload.guild_id] : []),
        ...params.payload,
      }),
    });

    return {
      description: 'Success',
    };
  }

  if (!caller) {
    yield* User.put({
      Item: User.make({
        pk     : params.caller_id,
        sk     : 'now',
        pkp    : params.caller_id,
        servers: new Set(params.payload.guild_id ? [params.payload.guild_id] : []),
        ...params.payload,
      }),
    });

    return {
      description: 'Success',
    };
  }

  const updated = User.make({
    ...caller,
    ...params.payload,
    servers: new Set(params.payload.guild_id ? [...caller.servers, params.payload.guild_id] : caller.servers),
  });

  if (!User.equal(updated, caller)) {
    yield* User.put({
      Item: updated,
    });
  }

  return {
    description: 'Success',
  };
});
