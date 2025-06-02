import {ClashOfClans} from '#src/service/ClashOfClans.ts';
import {type Server, type Link, Clan} from '#src/data/index.ts';
import {GSI2, ServerPartition, User} from '#src/data/index.ts';
import {DataClient} from '#src/service/DataClient.ts';
import type {Maybe} from '#src/internal/pure/types.ts';
import type {ClanWar} from 'clashofclans.js';
import type {Discord} from 'dfx';
import {DiscordREST} from 'dfx';
import * as Array from 'effect/Array';
import * as Chunk from 'effect/Chunk';
import * as Duration from 'effect/Duration';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as Option from 'effect/Option';
import * as Record from 'effect/Record';
import * as Sink from 'effect/Sink';
import * as Stream from 'effect/Stream';

type ServerClanWars = {
  clan   : Clan;
  prep?  : ClanWar | undefined;
  battle?: ClanWar | undefined;
};

const getServerClanWars = (clan: Clan) =>
  pipe(
    ClashOfClans.getWars(clan.sk),
    E.orElse(() =>
      ClashOfClans.getCurrentWar(clan.sk),
    ),
    E.timeout(Duration.seconds(10)),
    E.orElseSucceed(() => []),
    E.map((wars) => {
      const ws = !wars ? [] : Array.ensure(wars);
      const prep = ws.find((w) => w.isPreparationDay);
      const battle = ws.find((w) => w.isBattleDay);

      return {
        clan  : clan,
        prep  : prep,
        battle: battle,
      } satisfies ServerClanWars;
    }),
  );

const getTime = (time: Date) => {
  const current = new Date(time.getTime() - Date.now());
  const hours = current.getUTCHours().toString().padStart(2, '0');
  const minutes = current.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const updateCountdown = E.fn('updateCountdown')(function* (wars: ServerClanWars) {
  const clan = wars.clan;

  if (!clan.countdown) {
    return;
  }

  const discord = yield* DiscordREST;

  if (wars.battle) {
    const left = getTime(wars.battle.endTime);
    yield* discord.updateChannel(clan.countdown, {name: `🗡️│${clan.name}│${left}`});
  }
  else if (wars.prep) {
    const left = getTime(wars.prep.endTime);
    yield* discord.updateChannel(clan.countdown, {name: `🛠│${clan.name}│${left}`});
  }
  else {
    yield* discord.updateChannel(clan.countdown, {name: `💤│${clan.name}`});
  }
});

export const pollClanWar = E.fn('pollClanWar')(function* (server: Server, clan: Clan) {
  const wars = yield* getServerClanWars(clan);

  if (!clan.polling) {
    return;
  }

  yield* E.fork(
    updateCountdown(wars).pipe(
      E.timeout(Duration.seconds(10)),
      E.ignoreLogged,
    ),
  );

  if (!wars.prep) {
    return;
  }
  if (clan.prep_opponent === wars.prep.opponent.tag) {
    return;
  }

  yield* E.fork(
    Clan.create({
      ...clan,
      battle_opponent: clan.prep_opponent,
      prep_opponent  : wars.prep.opponent.tag,
    }),
  );

  // todo schedule events
});

type ServerPartitionUpStream = {
  server: Server;
  clans : Clan[];
};

const makeAccUpStream = (): ServerPartitionUpStream => ({
  server: undefined as any as Server,
  clans : [],
});

const syncClanWarStream = (serverId: string) =>
  pipe(
    Stream.paginateChunkEffect(undefined as any, (last) =>
      pipe(
        ServerPartition.scanUp({
          server: serverId,
          last  : last,
        }),
        E.map((res) => [Chunk.fromIterable(res.Items), Option.fromNullable(res.LastEvaluatedKey)]),
      ),
    ),
    Stream.transduce(
      Sink.foldLeft(makeAccUpStream(), (acc, item) => {
        if (item._tag === 'Server') {
          acc.server = item;
          return acc;
        }
        acc.clans.push(item);
        return acc;
      }),
    ),
    Stream.takeRight(1),
    Stream.flatMap((partition) =>
      pipe(
        Stream.make(...partition.clans),
        Stream.mapEffect((item) =>
          pollClanWar(partition.server, item),
        ),
      ),
    ),
    Stream.drain,
  );

const syncMemberLinksStream = (serverId: string) =>
  pipe(
    Stream.paginateChunkEffect(undefined as any, (last) =>
      GSI2.queryLinks({
        server: serverId,
        last  : last,
      }).pipe(
        E.map((res) => [
          Chunk.fromIterable(res.Items),
          Option.fromNullable(res.LastEvaluatedKey),
        ]),
      ),
    ),
    Stream.transduce(
      Sink.foldLeft(Record.empty<string, Link>(), (acc, link) => {
        acc[link.pk] = link;
        return acc;
      }),
    ),
    Stream.takeRight(1),
    Stream.flatMap((links) =>
      Stream.paginateChunkEffect(undefined as Maybe<Discord.GuildMemberResponse>, (last) =>
        DiscordREST.pipe(
          E.flatMap((discord) =>
            discord.listGuildMembers(serverId, {
              limit: 100,
              after: last?.user?.id as any,
            }),
          ),
          E.map((res) => [
            Chunk.fromIterable(res.filter((m) => !links[m.user!.id])),
            Array.last(res),
          ]),
        ),
      ),
    ),
    Stream.tap((member) =>
      // todo create a user registration if needed -> guess timezone from member.locale?
      DataClient.update({
        Key                      : User.Key.make({pk: member.user!.id}),
        ConditionExpression      : 'attribute_exists(pk)',
        UpdateExpression         : 'ADD servers :servers',
        ExpressionAttributeValues: {':servers': serverId},
      }),
    ),
    Stream.drain,
  );

export const syncServerStream = (serverId: string) =>
  Stream.mergeAll(
    [
      syncClanWarStream(serverId),
      syncMemberLinksStream(serverId),
    ],
    {
      concurrency: 'unbounded',
    },
  );
