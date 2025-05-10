import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {RegistryAdminError, RegistryDefect} from '#src/data/arch/util.ts';
import {ClanVerification, PlayerVerification} from '#src/data/constants/index.ts';
import * as ServerClanGsi from '#src/data/gsi/server-clan.gsi.ts';
import * as ServerClan from '#src/data/server-clan.ts';
import * as ServerRegistry from '#src/data/registry/server-registry.ts';
import * as UserPlayer from '#src/data/user-player.ts';
import * as UserPartition from '#src/data/partition/user.partition.ts';
import * as User from '#src/data/user.ts';
import * as Array from 'effect/Array';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as Order from 'effect/Order';
import * as Record from 'effect/Record';

type RegisterParams = {
  caller_id   : string;
  caller_roles: string[];
  guild_id    : string;
  clan_tag    : string;
  payload: {
    countdown: string;
  };
};

export const register = E.fn('ServerClanRegistry.register')(function* (p: RegisterParams) {
  const server = yield* ServerRegistry.getAssert(p.guild_id);

  if (!p.caller_roles.includes(server.admin)) {
    return yield* new RegistryAdminError({
      message: 'You are not authorized to register a clan for this server.',
    });
  }

  const userPartition = yield* UserPartition.getAll({
    KeyConditionExpression: {pk: p.caller_id},
    ConsistentRead        : true,
  });

  const user = userPartition.find((u) => User.is(u));

  if (!user) {
    return yield* new RegistryAdminError({
      message: 'Your Discord user account is not registered.',
    });
  }

  const userPlayers = pipe(
    userPartition,
    Array.filter((u) => UserPlayer.is(u)),
    Record.fromIterableWith((up) => [up.sk, up]),
  );

  if (!Record.size(userPlayers)) {
    return yield* new RegistryAdminError({
      message: 'You have no player accounts registered to your Discord account.',
    });
  }

  const gsi = yield* ServerClanGsi.query({
    KeyConditionExpression: {gsi_clan_tag: p.clan_tag},
  });

  if (gsi.Items.length > 1) {
    return yield* new RegistryDefect({});
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
      yield* ServerClan.deleteItem({Key: ServerClan.makeKey(current)});

      const updated = ServerClan.make({
        pk           : p.guild_id,
        sk           : p.clan_tag,
        gsi_server_id: p.guild_id,
        gsi_clan_tag : p.clan_tag,
        name         : clan.name,
        description  : clan.description,
        select       : {value: p.clan_tag, label: clan.name},
        verification,
        ...p.payload,
      });

      yield* ServerClan.putItem({Item: updated});
    }
    else {
      const updated = ServerClan.make({
        ...current,
        name       : clan.name,
        description: clan.description,
        verification,
        ...p.payload,
      });

      yield* ServerClan.putItem({Item: updated});
    }

    return {
      description: 'Success',
    };
  }

  const created = ServerClan.make({
    pk           : p.guild_id,
    sk           : p.clan_tag,
    gsi_server_id: p.guild_id,
    gsi_clan_tag : p.clan_tag,
    name         : clan.name,
    description  : clan.description,
    select       : {
      value: p.clan_tag,
      label: clan.name,
    },
    verification,
    ...p.payload,
  });

  yield* ServerClan.putItem({Item: created});

  return {
    description: 'Success',
  };
});
