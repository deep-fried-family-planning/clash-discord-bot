import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {type User, UserLink, UserPartition, UserPlayer} from '#src/data/index.ts';
import {user} from '#src/discord/commands/user.ts';
import * as Chunk from 'effect/Chunk';
import * as Duration from 'effect/Duration';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as Option from 'effect/Option';
import * as Record from 'effect/Record';
import * as Sink from 'effect/Sink';
import * as Stream from 'effect/Stream';

const pollPlayer = E.fn('pollPlayer')(function* (user: User, userPlayer: UserPlayer) {
  const account = yield* pipe(
    ClashOfClans.getPlayer(userPlayer.sk),
    E.timeout(Duration.seconds(10)),
    E.orElseSucceed(() => undefined),
  );

  if (!account) {
    return userPlayer;
  }

  if (userPlayer.name !== account.name) {
    const updated = {
      ...userPlayer,
      name: account.name,
    };

    yield* E.fork(
      UserPlayer.put({
        Item: updated,
      }),
    );

    return updated;
  }

  return userPlayer;
});

const makeAcc = () => ({
  user   : undefined as any as User,
  players: Record.empty<string, UserPlayer>(),
  links  : Record.empty<string, UserLink>(),
});

const streamUserPartition = (userId: string) =>
  pipe(
    Stream.paginateChunkEffect(undefined as any, (last) =>
      pipe(
        UserPartition.scan({
          user: userId,
          last: last,
        }),
        E.map((res) => [
          Chunk.fromIterable(res.Items),
          Option.fromNullable(res.LastEvaluatedKey),
        ]),
      ),
    ),
    Stream.run(
      Sink.foldLeft(makeAcc(), (acc, item) => {
        if (item._tag === 'User') {
          acc.user = item;
        }
        else if (item._tag === 'UserPlayer') {
          acc.players[item.sk] = item;
        }
        else {
          acc.links[item.sk] = item;
        }
        return acc;
      }),
    ),
  );

export const syncUser = E.fn('syncUser')(function* (userId: string) {
  const partition = yield* streamUserPartition(userId);

  const tags = yield* pipe(
    partition.players,
    Record.map((player) =>
      pipe(
        pollPlayer(partition.user, player),
        E.timeoutTo({
          duration : Duration.seconds(10),
          onSuccess: (updated) => updated,
          onTimeout: () => player,
        }),
      ),
    ),
    E.allWith({}),
    E.map((players) =>
      Record.map(players, (player) =>
        player.name,
      ),
    ),
  );

  const [invalid, current] = Record.partition(partition.links, (link) => partition.user.servers.has(link.sk));

  if (Record.size(invalid)) {
    yield* E.fork(
      E.all(
        Record.map(invalid, (link) =>
          UserLink.del({
            Key: UserLink.Key.make(link),
          }),
        ),
      ),
    );
  }

  const newServers = [...partition.user.servers.values()].filter((serverId) => !current[serverId]);

  if (newServers.length) {
    yield* E.fork(
      E.all(
        newServers.map((serverId) =>
          UserLink.put({
            Item: UserLink.make({
              pk  : partition.user.pk,
              sk  : serverId,
              pk2 : serverId,
              sk2 : partition.user.pk,
              tags: tags,
            }),
          }),
        ),
      ),
    );
  }

  const updates = Record.filterMap(
    current,
    (link) => {
      const updated = UserLink.make({
        ...link,
        tags: tags,
      });

      if (UserLink.equal(link, updated)) {
        return Option.none();
      }

      return Option.some(
        UserLink.put({
          Item: updated,
        }),
      );
    },
  );

  if (Record.size(updates)) {
    yield* E.fork(E.all(updates));
  }
});
