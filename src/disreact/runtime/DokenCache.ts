import type * as Doken from '#src/disreact/codec/doken.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import type * as Cause from 'effect/Cause';
import * as Cache from 'effect/Cache';
import * as Data from 'effect/Data';
import * as DateTime from 'effect/DateTime';
import * as Duration from 'effect/Duration';
import * as E from 'effect/Effect';
import * as Exit from 'effect/Exit';
import {pipe} from 'effect/Function';
import * as Option from 'effect/Option';

export class DokenCacheDefect extends Data.TaggedError('DokenCacheDefect')<{
  cause: Cause.Cause<Error> | Error;
}> {}

const timeToLive = (exit: Exit.Exit<Doken.Active | undefined, DokenCacheDefect>): Duration.Duration =>
  pipe(
    Exit.getOrElse(exit, () => undefined),
    Option.fromNullable,
    Option.flatMap((doken) =>
      pipe(
        E.runSync(DateTime.now),
        DateTime.distanceDurationEither(doken.ttl),
        Option.getRight,
      ),
    ),
    Option.getOrElse(() => Duration.zero),
  );

export type DokenCacheConfig = {
  capacity: number;
};

export class DokenCache extends E.Service<DokenCache>()('disreact/DokenCache', {
  effect: E.fnUntraced(function* (config: DokenCacheConfig) {
    const cache = yield* Cache.makeWith({
      timeToLive,
      capacity: config.capacity,
      lookup  : (_: string): E.Effect<Doken.Active | undefined, DokenCacheDefect> => E.succeed(undefined),
    });

    return {
      save: (doken: Doken.Active): E.Effect<void, DokenCacheDefect> =>
        cache.set(doken.id, doken),
      load: (id: string): E.Effect<Doken.Active | undefined, DokenCacheDefect> =>
        cache.get(id),
      free: (id: string): E.Effect<void, DokenCacheDefect> =>
        cache.invalidate(id),
    };
  }),
  accessors: true,
}) {}

export class DokenMemoryDynamoDB extends E.Service<DokenCache>()('disreact/DokenMemory', {
  effect: E.fnUntraced(function* (config: DokenCacheConfig) {
    const dynamo = yield* DynamoDBDocument;

    const cache = yield* Cache.makeWith({
      timeToLive,
      capacity: config.capacity,
      lookup  : (id: string) =>
        pipe(
          dynamo.get({
            TableName: process.env.DDB_OPERATIONS,
            Key      : {pk: `t-${id}`, sk: `t-${id}`},
          }),
          E.catchAllCause((cause) => new DokenCacheDefect({cause})),
          E.map((resp) => resp.Item as Doken.Active | undefined),
        ),
    });

    return {
      load: (id) => cache.get(id),
      save: (doken) =>
        pipe(
          dynamo.put({
            TableName: process.env.DDB_OPERATIONS,
            Item     : {
              pk: `t-${doken.id}`,
              sk: `t-${doken.id}`,
              ...doken,
            },
          }),
          E.catchAll((cause) => new DokenCacheDefect({cause})),
          E.tap(() => cache.set(doken.id, doken)),
        ),
      free: (id) =>
        pipe(
          dynamo.delete({
            TableName: process.env.DDB_OPERATIONS,
            Key      : {
              pk: `t-${id}`,
              sk: `t-${id}`,
            },
          }),
          E.catchAllCause((cause) => new DokenCacheDefect({cause})),
          E.tap(() => cache.invalidate(id)),
        ),
    } as Omit<DokenCache, '_tag'>;
  }),
  dependencies: [
    DynamoDBDocument.defaultLayer,
  ],
  accessors: true,
}) {}
