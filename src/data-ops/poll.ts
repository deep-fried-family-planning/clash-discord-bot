import {pollServer} from '#src/data-ops/poll-server.ts';
import {pollUser} from '#src/data-ops/poll-user.ts';
import * as Stream from 'effect/Stream';
import * as E from 'effect/Effect';
import * as Option from 'effect/Option';
import {pipe} from 'effect/Function';
import {GsiPoll} from '#src/data/index.ts';
import * as Chunk from 'effect/Chunk';

export const pollStream = Stream.paginateChunkEffect(
  undefined as any,
  (last) => {
    return pipe(
      GsiPoll.scan({
        ExclusiveStartKey: last,
      }),
      E.map((res) => [
        Chunk.fromIterable(res.Items),
        Option.fromNullable(res.LastEvaluatedKey),
      ]),
    );
  },
);

export const runPoll = E.fn('runPoll')(function* () {
  const stream = yield* pipe(
    Stream.paginateChunkEffect(
      undefined as any,
      (last) => {
        return pipe(
          GsiPoll.scan({
            ExclusiveStartKey: last,
          }),
          E.map((res) => [
            Chunk.fromIterable(res.Items),
            Option.fromNullable(res.LastEvaluatedKey),
          ]),
        );
      },
    ),
    Stream.mapEffect((item) => {
      if (item._tag === 'Server') {
        return pollServer(item.pk);
      }
      return pollUser(item.pk);
    }),
    Stream.runCollect,
  );
});

const thing = Stream.runCollect(pollStream).pipe(E.map((item) => item.pipe));
