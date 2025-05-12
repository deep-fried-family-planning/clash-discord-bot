import {GsiLink, ServerClan, ServerPartition, type Server} from '#src/data/index.ts';
import * as E from 'effect/Effect';
import * as Array from 'effect/Array';
import * as Record from 'effect/Record';
import {pipe} from 'effect/Function';

export const pollServer = E.fn('pollServer')(function* (server: Server) {
  const serverPartition = yield* ServerPartition.scan({
    ConsistentRead        : true,
    KeyConditionExpression: {pk: server.pk},
  });

  const serverLinkPartition = yield* GsiLink.scanServer({
    KeyConditionExpression: {pkl: server.pk},
  });

  const serverPlayers = pipe(
    serverLinkPartition.Items,
    Array.flatMap((item) =>
      pipe(
        item.tags,
        Record.toEntries,
        Array.map(([name, tag]) => ({
          user: item.pk,
          name,
          tag,
        })),
      ),
    ),
    Record.fromIterableWith((item) => [item.tag, item]),
  );

  const serverClans = serverPartition.Items.filter((item) => ServerClan.is(item));
});
