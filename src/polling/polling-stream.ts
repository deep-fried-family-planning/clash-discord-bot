import {syncServerStream} from '#src/polling/sync-server.ts';
import {syncUser} from '#src/polling/sync-user.ts';
import * as Stream from 'effect/Stream';
import * as E from 'effect/Effect';
import { GSI1 } from '#src/data/index.ts';
import * as Chunk from 'effect/Chunk';
import * as Option from 'effect/Option';
import * as Record from 'effect/Record';
import * as Sink from 'effect/Sink';
import {pipe} from 'effect/Function';

export const gsiPollStream = pipe(
  Stream.paginateChunkEffect(
    undefined as any,
    (key) => GSI1.scan(key).pipe(
      E.map((res) => [
        Chunk.fromIterable(res.Items),
        Option.fromNullable(res.LastEvaluatedKey),
      ]),
    ),
  ),
  Stream.flatMap((item) => {
    if (item._tag === 'Server') {
      return syncServerStream(item.pk);
    }
    return syncUser(item.pk).pipe(
      Stream.fromEffect,
      Stream.drain,
    );
  }),
);
