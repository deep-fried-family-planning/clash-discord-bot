import type {ServerPartition, UserPartition} from '#src/data/items/index.ts';
import  { User, UserPlayer, UserServerLink, Server} from '#src/data/items/index.ts';
import {DiscordREST} from 'dfx';
import * as E from 'effect/Effect';
import * as Data from 'effect/Data';
import * as Record from 'effect/Record';
import * as Array from 'effect/Array';
import * as Stream from 'effect/Stream';
import { pipe } from 'effect/Function';

export class PartitionSyncError extends Data.TaggedError('PartitionSyncError')<{
  cause: any;
}> {}

export class PartitionSyncDefect extends Data.TaggedError('PartitionSyncError')<{
  cause: any;
}> {}

export const syncUserToServer = E.fn('syncUser')(function* (server_id: string, partition: UserPartition) {
  if (!partition.length) {
    return [];
  }

  const upgraded = partition.filter((u) => u.upgraded);

  if (upgraded.length) {
    return upgraded;
  }

  const user = partition.find((u) => User.is(u));

  if (!user) {
    return yield* new PartitionSyncDefect({cause: 'No user found'});
  }

  const players = pipe(
    partition.filter((u) => UserPlayer.is(u)),
    Record.fromIterableWith((up) => [up.sk, up.name]),
  );

  const links = pipe(
    partition.filter((u) => UserServerLink.is(u)),
    Record.fromIterableWith((usl) => [usl.sk, usl]),
  );

  const baseLink = {
    pk  : user.pk,
    sk  : server_id,
    pkl : server_id,
    skl : user.pk,
    tags: players,
  };

  if (!links[server_id]) {
    const newLink = UserServerLink.make(baseLink);

    if (!user.servers.has(server_id)) {
      user.servers.add(server_id);
      return [user, newLink];
    }
    return [newLink];
  }

  const updatedLink = UserServerLink.make({
    ...links[server_id],
    ...baseLink,
  });

  if (UserServerLink.equal(updatedLink, links[server_id])) {
    return [];
  }
  return [updatedLink];
});

export const syncServerUsers = E.fn('syncServerUsers')(function* (partition: ServerPartition) {
  if (!partition.length) {
    return [];
  }

  const upgraded = partition.filter((u) => u.upgraded);

  if (upgraded.length) {
    return upgraded;
  }

  const server = partition.find((u) => Server.is(u));

  if (!server) {
    return yield* new PartitionSyncDefect({cause: 'No server found'});
  }

  const links = pipe(
    partition.filter((u) => UserServerLink.is(u)),
    Record.fromIterableWith((usl) => [usl.pk, usl]),
  );

  const discord = yield* DiscordREST;
  const members = yield* discord.listGuildMembers(server.pk).json;

  const [unlinked, linked] = Array.partition(members, (m) => m.user!.id in links);

  return [];
});
