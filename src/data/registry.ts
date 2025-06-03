import {ClanVerification, PlayerVerification} from '#src/data/util/index.ts';
import * as GSI2 from '#src/data/gsi/gsi2.ts';
import * as Clan from '#src/data/partition-server/clan.ts';
import * as Server from '#src/data/partition-server/server.ts';
import * as Player from '#src/data/partition-user/player.ts';
import * as UserPartition from '#src/data/partition-user/user.partition.ts';
import * as User from '#src/data/partition-user/user.ts';
import {ClashOfClans} from '#src/service/ClashOfClans.ts';
import * as Array from 'effect/Array';
import type * as Cause from 'effect/Cause';
import * as Data from 'effect/Data';
import type * as DateTime from 'effect/DateTime';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as Order from 'effect/Order';
import * as Record from 'effect/Record';

export class RegistryDefect extends Data.TaggedError('RegistryDefect')<{
  cause: string;
}> {}

export class RegistryFailure extends Data.TaggedError('RegistryFailure')<{
  cause: Cause.Cause<Error>;
}> {}

export class RegistryUserError extends Data.TaggedError('RegistryUserError')<{
  message: string;
}> {}

export class RegistryAdminError extends Data.TaggedError('RegistryAdminError')<{
  message: string;
}> {}

export class RegistryAssertError extends Data.TaggedError('RegistryAssertError')<{
  message: string;
}> {}

const saveUser = (user: Parameters<typeof User.make>[0]) =>
  pipe(
    User.create(User.make(user)),
    E.catchAllCause((cause) => new RegistryFailure({cause})),
  );

const getUser = (user_id: string) =>
  pipe(
    User.read({
      Key           : {pk: user_id, sk: '@'},
      ConsistentRead: true,
    }),
    E.catchAllCause((cause) => new RegistryFailure({cause})),
    E.map((res) => res.Item),
  );

export const assertUser = (user_id: string) =>
  pipe(
    getUser(user_id),
    E.flatMap(E.fromNullable),
    E.catchTag('NoSuchElementException', () => new RegistryAssertError({message: 'User is not registered.'})),
  );

const saveServer = (server: Parameters<typeof Server.make>[0]) =>
  pipe(
    Server.create(Server.make(server)),
    E.catchAllCause((cause) => new RegistryFailure({cause})),
  );

const getServer = (server_id: string) =>
  pipe(
    Server.read({
      Key           : {pk: server_id, sk: '@'},
      ConsistentRead: true,
    }),
    E.catchAllCause((cause) => new RegistryFailure({cause})),
    E.map((res) => res.Item),
  );

export const assertServer = (server_id: string) =>
  pipe(
    getServer(server_id),
    E.flatMap(E.fromNullable),
    E.catchTag('NoSuchElementException', () => new RegistryAssertError({message: 'User is not registered.'})),
  );

const savePlayer = (player: Parameters<typeof Player.make>[0]) =>
  pipe(
    Player.create(Player.make(player)),
    E.catchAllCause((cause) => new RegistryFailure({cause})),
  );

const getPlayer = (user_id: string, player_tag: string) =>
  pipe(
    Player.read({
      Key           : {pk: user_id, sk: player_tag},
      ConsistentRead: true,
    }),
    E.catchAllCause((cause) => new RegistryFailure({cause})),
    E.map((res) => res.Item),
  );

export const assertPlayer = (user_id: string, player_tag: string) =>
  pipe(
    getPlayer(user_id, player_tag),
    E.flatMap(E.fromNullable),
    E.catchTag('NoSuchElementException', () => new RegistryAssertError({message: 'Player is not registered.'})),
  );

const saveClan = (clan: Parameters<typeof Clan.make>[0]) =>
  pipe(
    Clan.create(Clan.make(clan)),
    E.catchAllCause((cause) => new RegistryFailure({cause})),
  );

type Caller = {
  id    : string;
  roles?: string[];
};

type CallerContext = {
  id: string;
};

type UserParams = {
  caller_id : string;
  target_id?: string | undefined;
  payload: {
    timezone: DateTime.TimeZone;
  };
};

export const registerUser = E.fn('registerUser')(function* (params: UserParams) {
  if (params.target_id === params.caller_id) {
    return yield* new RegistryAdminError({
      message: 'You cannot admin re-register yourself.',
    });
  }

  const caller = yield* getUser(params.caller_id);

  if (params.target_id) {
    if (!caller) {
      return yield* new RegistryAdminError({
        message: 'Caller is not registered.',
      });
    }

    const target = yield* getUser(params.target_id);

    if (target) {
      return yield* new RegistryAdminError({
        message: 'User already registered.',
      });
    }

    yield* saveUser({
      pk     : params.target_id,
      sk     : '@',
      pk1    : params.target_id,
      servers: new Set([]),
      ...params.payload,
    });

    return {
      description: 'Success',
    };
  }

  if (!caller) {
    yield* User.create(
      User.make({
        pk     : params.caller_id,
        sk     : '@',
        pk1    : params.caller_id,
        servers: new Set([]),
        ...params.payload,
      }),
    );

    return {
      description: 'Success',
    };
  }

  const updated = User.make({
    ...caller,
    ...params.payload,
  });

  if (!User.equal(updated, caller)) {
    yield* User.create(updated);
  }

  return {
    description: 'Success',
  };
});

type ServerParams = {
  caller_id   : string;
  caller_roles: string[];
  guild_id    : string;
  payload: {
    admin: string;
  };
};

export const registerServer = E.fn('registerServer')(function* (params: ServerParams) {
  if (!params.caller_roles.includes(params.payload.admin)) {
    return yield* new RegistryUserError({
      message: 'You do not have the given admin role.',
    });
  }

  const server = yield* getServer(params.guild_id);

  if (!server) {
    yield* saveServer({
      pk : params.guild_id,
      sk : '@',
      pk1: params.guild_id,
      ...params.payload,
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

  yield* saveServer({
    ...server,
    pk: params.guild_id,
    sk: '@',
    ...params.payload,
  });

  return {
    description: 'Success',
  };
});

type ClanParams = {
  caller_id   : string;
  caller_roles: string[];
  guild_id    : string;
  clan_tag    : string;
  payload: {
    countdown: string;
  };
};

export const registerClan = E.fn('registerClan')(function* (p: ClanParams) {
  const server = yield* assertServer(p.guild_id);

  if (!p.caller_roles.includes(server.admin)) {
    return yield* new RegistryAdminError({
      message: 'You are not authorized to register a clan for this server.',
    });
  }

  const userPartition = yield* UserPartition.scanUp(p.caller_id);

  const user = userPartition.Items.find((u) => User.is(u));

  if (!user) {
    return yield* new RegistryAdminError({
      message: 'Your Discord user account is not registered.',
    });
  }

  const userPlayers = pipe(
    userPartition.Items,
    Array.filter((u) => Player.is(u)),
    Record.fromIterableWith((up) => [up.sk, up]),
  );

  if (!Record.size(userPlayers)) {
    return yield* new RegistryAdminError({
      message: 'You have no player accounts registered to your Discord account.',
    });
  }

  const gsi = yield* GSI2.queryClan(p.clan_tag);

  if (gsi.Items.length > 1) {
    return yield* new RegistryDefect({
      cause: 'Multiple clan records found.',
    });
  }

  const clan = yield* ClashOfClans.getClan(p.clan_tag);

  const verifications = pipe(
    clan.members,
    Array.filter((m) => m.role !== 'member'),
    Array.filter((m) => m.tag in userPlayers),
    Array.filter((m) => userPlayers[m.tag].verification >= PlayerVerification.token),
    Array.map((m) =>
      m.role === 'leader' ? ClanVerification.leader :
        m.role === 'coLeader' ? ClanVerification.coleader :
          ClanVerification.elder,
    ),
    Array.sort(Order.number),
  );

  if (!verifications.length) {
    return yield* new RegistryAdminError({
      message: 'Your Discord account has no verified player links (elder or above) in this clan.',
    });
  }

  const verification = verifications[0];

  if (gsi.Items.length === 1) {
    const current = gsi.Items[0];

    if (current.verification > verification) {
      return yield* new RegistryAdminError({
        message: 'Your member player links cannot override the current verification level of this clan.',
      });
    }

    if (current.pk !== p.guild_id) {
      yield* Clan.remove({
        Key: {pk: current.pk, sk: current.sk},
      });

      yield* saveClan({
        pk         : p.guild_id,
        sk         : p.clan_tag,
        pk2        : p.clan_tag,
        sk2        : p.guild_id,
        name       : clan.name,
        description: clan.description,
        select     : {
          value: p.clan_tag,
          label: clan.name,
        },
        verification,
        ...p.payload,
      });
    }
    else {
      yield* saveClan({
        ...current,
        name       : clan.name,
        description: clan.description,
        verification,
        ...p.payload,
      });
    }

    return {
      description: 'Success',
    };
  }

  yield* saveClan({
    pk         : p.guild_id,
    sk         : p.clan_tag,
    pk2        : p.clan_tag,
    sk2        : p.guild_id,
    name       : clan.name,
    description: clan.description,
    select     : {
      value: p.clan_tag,
      label: clan.name,
    },
    verification,
    ...p.payload,
  });

  return {
    description: 'Success',
  };
});

type PlayerParams = {
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

export const registerPlayer = E.fn('registerPlayer')(function* (p: PlayerParams) {
  yield* assertUser(p.caller_id);

  if (!p.api_token) {
    if (!p.target_id) {
      return yield* new RegistryAdminError({
        message: 'You must provide a target user id to admin register a player account.',
      });
    }
    if (!p.guild_id || !p.caller_roles) {
      return yield* new RegistryAdminError({
        message: 'Admin registration must be within context of a server.',
      });
    }

    const server = yield* assertServer(p.guild_id);

    if (!p.caller_roles.includes(server.admin)) {
      return yield* new RegistryAdminError({
        message: 'You are not authorized to register a player account for this server.',
      });
    }

    const gsi = yield* GSI2.queryPlayer(p.player_tag);

    if (gsi.Items.length > 1) {
      return yield* new RegistryDefect({cause: 'Multiple player records found.'});
    }

    const player = yield* ClashOfClans.getPlayer(p.player_tag);

    if (gsi.Items.length === 1) {
      const current = gsi.Items[0];

      if (current.verification >= PlayerVerification.token) {
        return yield* new RegistryAdminError({
          message: 'You are not authorized to update the registration of this player account.',
        });
      }

      yield* Player.remove({
        Key: {
          pk: current.pk,
          sk: current.sk,
        },
      });

      yield* savePlayer({
        pk          : p.target_id,
        sk          : p.player_tag,
        pk2         : p.player_tag,
        sk2         : p.target_id,
        name        : player.name,
        ...p.payload,
        verification: PlayerVerification.admin,
      });

      return {
        description: 'Success',
      };
    }

    yield* Player.create(
      Player.make({
        pk          : p.target_id,
        sk          : p.player_tag,
        pk2         : p.player_tag,
        sk2         : p.target_id,
        name        : player.name,
        ...p.payload,
        verification: PlayerVerification.admin,
      }),
    );

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
    return yield* new RegistryDefect({
      cause: 'Multiple player records found.',
    });
  }

  const player = yield* ClashOfClans.getPlayer(p.player_tag);

  if (gsi.Items.length === 1) {
    const current = gsi.Items[0];

    if (current.pk !== p.caller_id) {
      yield* Player.remove({
        Key: {
          pk: current.pk,
          sk: current.sk,
        },
      });

      yield* Player.create(
        Player.make({
          ...current,
          pk          : p.caller_id,
          sk          : p.player_tag,
          pk2         : p.player_tag,
          sk2         : p.caller_id,
          name        : player.name,
          ...p.payload,
          verification: PlayerVerification.token,
        }),
      );

      return {
        description: 'Success',
      };
    }

    yield* Player.create(
      Player.make({
        ...current,
        name        : player.name,
        ...p.payload,
        verification: PlayerVerification.token,
      }),
    );

    return {
      description: 'Success',
    };
  }

  yield* Player.create(
    Player.make({
      pk          : p.caller_id,
      sk          : p.player_tag,
      pk2         : p.player_tag,
      sk2         : p.caller_id,
      name        : player.name,
      ...p.payload,
      verification: PlayerVerification.token,
    }),
  );

  return {
    description: 'Success',
  };
});
