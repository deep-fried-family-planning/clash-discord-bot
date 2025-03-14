
import {DokenMemoryError} from '#src/disreact/codec/error.ts';
import type * as Doken from '#src/disreact/codec/wire/abstract/doken.ts';
import {DisReactConfig} from '#src/disreact/interface/DisReactConfig.ts';
import {C, DR, DT, E, L, OPT} from '#src/internal/pure/effect.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {type Cause, Duration, Exit, pipe} from 'effect';



export type DokenError =
  | DokenMemoryError
  | Cause.UnknownException;

const timeToLive = (exit: Exit.Exit<Doken.MaybeDefer, Doken.Err>): DR.Duration =>
  pipe(
    Exit.getOrElse(exit, () => undefined),
    OPT.fromNullable,
    OPT.flatMap((doken) =>
      pipe(
        E.runSync(DT.now),
        DT.distanceDurationEither(doken.ttl),
        OPT.getRight,
      ),
    ),
    OPT.getOrElse(() => DR.millis(0)),
  );

export class DokenMem extends E.Service<DokenMem>()('disreact/DokenMemory', {
  effect: E.gen(function* () {
    const dynamo = yield* DynamoDBDocument;
    const config = yield* DisReactConfig;

    const cache = yield* C.makeWith({
      lookup: (id: string): E.Effect<Doken.MaybeDefer, Doken.Err> =>
        pipe(
          dynamo.get({
            TableName: process.env.DDB_OPERATIONS,
            Key      : {
              pk: `t-${id}`,
              sk: `t-${id}`,
            },
          }),
          E.catchAll((e) => new DokenMemoryError(e)),
          E.map((resp) => resp.Item as Doken.MaybeDefer),
        ),
      capacity: 1000,
      timeToLive,
    });

    return {
      load: (id: string): E.Effect<Doken.MaybeDefer, Doken.Err> => cache.get(id),

      save: (doken: Doken.Defer): E.Effect<void, Doken.Err> =>
        pipe(
          dynamo.put({
            TableName: process.env.DDB_OPERATIONS,
            Item     : {
              pk: `t-${doken.id}`,
              sk: `t-${doken.id}`,
              ...doken,
            },
          }),
          E.catchAll((e) => new DokenMemoryError(e)),
          E.andThen(() => cache.set(doken.id, doken)),
        ),

      free: (id: string): E.Effect<void, Doken.Err> =>
        pipe(
          dynamo.delete({
            TableName: process.env.DDB_OPERATIONS,
            Key      : {
              pk: `t-${id}`,
              sk: `t-${id}`,
            },
          }),
          E.catchAll((e) => new DokenMemoryError(e)),
          E.andThen(() => cache.invalidate(id)),
        ),
    };
  }),

  dependencies: [DynamoDBDocument.defaultLayer],
  accessors   : true,
}) {}



export class DokenMemory extends E.Tag('DisReact.DokenMemory')<
  DokenMemory,
  IDokenMemory
>() {
  static readonly localLayer = (config: LocalDokenMemoryConfig) =>
    pipe(
      LocalDokenMemory(config),
    );

  static readonly dynamoLayer = (TableName: string) =>
    pipe(
      DynamoDokenMemory(TableName),
      L.provide(DynamoDBDocument.defaultLayer),
    );
}

export type LocalDokenMemoryConfig = {
  capacity?  : number;
  timeToLive?: Duration.DurationInput;
};

export const LocalDokenMemory = (config: LocalDokenMemoryConfig) => L.effect(DokenMemory, E.gen(function* () {
  const cache = yield* C.make({
    capacity  : config.capacity ?? 1000,
    timeToLive: config.timeToLive ?? '12 minutes',
    lookup    : () => E.succeed(null as null | Doken.Defer),
  });

  return {
    save   : (doken) => cache.set(doken.id, doken),
    load   : (id) => cache.get(id),
    free   : (id) => cache.invalidate(id),
    memSave: (doken) => cache.set(doken.id, doken),
    memLoad: (id) => cache.get(id),
    memFree: (id) => cache.invalidate(id),
  };
}));

const DynamoDokenMemory = (TableName: string) => L.effect(DokenMemory, E.gen(function* () {
  const dynamo = yield* DynamoDBDocument;

  const cache = yield* C.makeWith({
    lookup: (id: string) =>
      pipe(
        dynamo.get({
          TableName,
          Key: {
            pk: `t-${id}`,
            sk: `t-${id}`,
          },
        }),
        E.map((resp) => resp.Item ? resp.Item as Doken.Defer : null),
      ),
    timeToLive: (exit) =>
      Exit.match(exit, {
        onFailure: () => Duration.millis(0),
        onSuccess: (d) => !d
          ? Duration.millis(0)
          : Duration.minutes(5),
      }),
    capacity: 1000,
  });

  return {
    load: (id) =>
      pipe(
        cache.get(id),
        E.catchAll((e: Error) => new DokenMemoryError({cause: e})),
      ),
    memLoad: (id) =>
      pipe(
        cache.contains(id),
        E.if({
          onTrue : () => cache.get(id),
          onFalse: () => E.succeed(null),
        }),
        E.catchAll((e: Error) => new DokenMemoryError({cause: e})),
      ),
    free: (id) =>
      pipe(
        cache.invalidate(id),
        E.tap(() => dynamo.delete({
          TableName,
          Key: {
            pk: `t-${id}`,
            sk: `t-${id}`,
          },
        })),
        E.catchAll((e: Error) => new DokenMemoryError({cause: e})),
      ),
    memFree: (id) => cache.invalidate(id),
    save   : (d) =>
      pipe(
        cache.set(d.id, d),
        E.tap(() => dynamo.put({
          TableName,
          Item: {
            pk: `t-${d.id}`,
            sk: `t-${d.id}`,
            ...d,
          },
        })),
        E.catchAll((e: Error) => new DokenMemoryError({cause: e})),
      ),
    memSave: (d) => cache.set(d.id, d),
  };
}));


export interface IDokenMemory {
  load   : (id: string) => E.Effect<Doken.Defer | null, DokenError>;
  memLoad: (id: string) => E.Effect<Doken.Defer | null, DokenError>;
  free   : (id: string) => E.Effect<void, DokenError>;
  memFree: (id: string) => E.Effect<void, DokenError>;
  save   : (d: Doken.Defer) => E.Effect<void, DokenError>;
  memSave: (d: Doken.Defer) => E.Effect<void, DokenError>;
}
