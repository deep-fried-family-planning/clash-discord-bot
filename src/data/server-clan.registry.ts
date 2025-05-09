import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {RegistryAdminError, RegistryDefect} from '#src/data/arch/util.ts';
import {ClanVerification, PlayerVerification} from '#src/data/constants/index.ts';
import * as ServerClanGsi from '#src/data/server-clan.gsi.ts';
import * as ServerClan from '#src/data/server-clan.ts';
import * as ServerRegistry from '#src/data/server.registry.ts';
import * as UserPlayer from '#src/data/user-player.ts';
import * as UserPartition from '#src/data/user.partition.ts';
import * as Array from 'effect/Array';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as Record from 'effect/Record';

type RegisterParams = {
  guild_id    : string;
  caller_id   : string;
  caller_roles: string[];
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

  const user = yield* UserPartition.getAll({
    KeyConditionExpression: {pk: p.caller_id},
    ConsistentRead        : true,
  });

  const userPlayers = pipe(
    user,
    Array.filter((u) => UserPlayer.is(u)),
    Record.fromIterableWith((up) => [up.sk, up]),
  );

  if (!Record.size(userPlayers)) {
    return yield* new RegistryAdminError({
      message: 'You have no player accounts registered to your Discord account.',
    });
  }

  const gsi = yield* ServerClanGsi.query({
    IndexName             : ServerClanGsi.Index,
    KeyConditionExpression: {gsi_clan_tag: p.clan_tag},
  });

  if (gsi.Items.length > 1) {
    return yield* new RegistryDefect({});
  }

  const clan = yield* ClashOfClans.getClan(p.clan_tag);

  const verifications = pipe(
    clan.members,
    Array.filter((m) => m.role !== 'member'),
    Array.filter((m) => m.tag in userPlayers && userPlayers[m.tag].verification >= PlayerVerification.token),
    Array.map((m) =>
      m.role === 'leader' ? ClanVerification.leader :
        m.role === 'coLeader' ? ClanVerification.coleader :
          ClanVerification.elder,
    ),
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
      yield* ServerClan.put({
        Item: ServerClan.make({
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
          ...p.payload,
        }),
      });
    }
    else {
      yield* ServerClan.put({
        Item: ServerClan.make({
          ...current,
          name       : clan.name,
          description: clan.description,
          verification,
          ...p.payload,
        }),
      });
    }

    return {
      description: 'Success',
    };
  }

  yield* ServerClan.put({
    Item: ServerClan.make({
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
      ...p.payload,
    }),
  });

  return {
    description: 'Success',
  };
});
