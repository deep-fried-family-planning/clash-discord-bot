import {RegistryAdminError} from '#src/data/arch/util.ts';
import * as User from '#src/data/user.ts';
import type * as DateTime from 'effect/DateTime';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

export const get = (user_id: string) =>
  pipe(
    User.getItem({
      Key           : {pk: user_id, sk: 'now'},
      ConsistentRead: true,
    }),
    E.map((res) => res.Item),
  );

export const getAssert = (user_id: string) =>
  pipe(
    User.getItem({
      Key           : {pk: user_id, sk: 'now'},
      ConsistentRead: true,
    }),
    E.flatMap((res) => E.fromNullable(res.Item)),
  );

type RegisterParams = {
  caller_id : string;
  target_id?: string;
  payload: {
    timezone: DateTime.TimeZone;
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

    yield* User.putItem({
      Item: User.make({
        pk             : params.target_id,
        sk             : 'now',
        gsi_all_user_id: params.target_id,
        ...params.payload,
      }),
    });

    return {
      description: 'Success',
    };
  }

  if (!caller) {
    const created = User.make({
      pk             : params.caller_id,
      sk             : 'now',
      gsi_all_user_id: params.caller_id,
      ...params.payload,
    });

    yield* User.putItem({Item: created});

    return {
      description: 'Success',
    };
  }

  const updated = User.make({
    ...caller,
    ...params.payload,
  });

  if (!User.isEqual(updated, caller)) {
    yield* User.putItem({Item: updated});
  }

  return {
    description: 'Success',
  };
});
