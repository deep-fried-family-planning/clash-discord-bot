import type {Doken} from '#src/disreact/codec/rest/doken.ts';
import {DisReactConfig} from '#src/disreact/runtime/DisReactConfig.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import * as Cache from 'effect/Cache';
import * as Data from 'effect/Data';
import * as DateTime from 'effect/DateTime';
import * as Duration from 'effect/Duration';
import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import {pipe} from 'effect/Function';
import * as Option from 'effect/Option';

export class DokenMemoryError extends Data.TaggedError('DokenMemoryError')<{
  cause?: any;
}> {}

const timeToLive = (exit: Exit.Exit<Doken.Active | undefined, DokenMemoryError>): Duration.Duration =>
  pipe(
    Exit.getOrElse(exit, () => undefined),
    Option.fromNullable,
    Option.flatMap((doken) =>
      pipe(
        Effect.runSync(DateTime.now),
        DateTime.distanceDurationEither(doken.ttl),
        Option.getRight,
      ),
    ),
    Option.getOrElse(() => Duration.zero),
  );

export class DokenMemory extends Effect.Service<DokenMemory>()('disreact/DokenMemory', {
  effect: Effect.gen(function* () {
    const config = yield* DisReactConfig;

    const cache = yield* Cache.makeWith({
      timeToLive,
      capacity: config.dokenCapacity,
      lookup  : (_: string): Effect.Effect<Doken.Active | undefined, DokenMemoryError> =>
        Effect.succeed(undefined),
    });

    return {
      save: (doken: Doken.Active): Effect.Effect<void, DokenMemoryError> =>
        cache.set(doken.id, doken),
      load: (id: string): Effect.Effect<Doken.Active | undefined, DokenMemoryError> =>
        cache.get(id),
      free: (id: string): Effect.Effect<void, DokenMemoryError> =>
        cache.invalidate(id),
    };
  }),
  accessors: true,
}) {}

export class DokenMemoryDynamoDB extends Effect.Service<DokenMemory>()('disreact/DokenMemory', {
  effect: Effect.gen(function* () {
    const dynamo = yield* DynamoDBDocument;
    const config = yield* DisReactConfig;

    const cache = yield* Cache.makeWith({
      timeToLive,
      capacity: config.dokenCapacity,
      lookup  : (id: string) =>
        pipe(
          dynamo.get({
            TableName: process.env.DDB_OPERATIONS,
            Key      : {pk: `t-${id}`, sk: `t-${id}`},
          }),
          Effect.catchAll((cause) => new DokenMemoryError({cause})),
          Effect.map((resp) => resp.Item as Doken.Active | undefined),
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
          Effect.catchAll((cause) => new DokenMemoryError({cause})),
          Effect.tap(() => cache.set(doken.id, doken)),
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
          Effect.catchAll((cause) => new DokenMemoryError({cause})),
          Effect.tap(() => cache.invalidate(id)),
        ),
    } as Omit<DokenMemory, '_tag'>;
  }),
  dependencies: [
    DynamoDBDocument.defaultLayer,
  ],
  accessors: true,
}) {}
