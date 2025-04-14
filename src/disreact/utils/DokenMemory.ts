import type {Doken} from '#src/disreact/codec/doken.ts';
import {DisReactConfig} from '#src/disreact/utils/DisReactConfig.ts';
import {C, DR, DT, E, L, OPT} from '#src/internal/pure/effect.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Cache, type Cause, Data, Exit, pipe} from 'effect';

export class DokenMemoryError extends Data.TaggedError('DisReact.DokenMemoryError')<{
  cause?: any;
}> {}

export type DokenError =
  | DokenMemoryError
  | Cause.UnknownException;

const timeToLive = (exit: Exit.Exit<Doken.Active | undefined, DokenError>): DR.Duration =>
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

export class DokenMemory extends E.Service<DokenMemory>()('disreact/DokenMemory', {
  effect: E.gen(function* () {
    const config = yield* DisReactConfig;
    const cache = yield* Cache.makeWith({
      timeToLive,
      capacity: config.dokenCapacity,
      lookup  : (_: string) => E.succeed(undefined as Doken.Active | undefined),
    });

    return {
      save: (doken: Doken.Active) => cache.set(doken.id, doken) as E.Effect<void, DokenError>,
      load: (id: string) => cache.get(id) as E.Effect<Doken.Active | undefined, DokenError>,
      free: (id: string) => cache.invalidate(id) as E.Effect<void, DokenError>,
    };
  }),
}) {
  static readonly Dynamo = pipe(
    L.effect(this, E.suspend(() => makeDynamo)),
    L.provide(DynamoDBDocument.defaultLayer),
  );
}

const makeDynamo = E.gen(function* () {
  const dynamo = yield* DynamoDBDocument;
  const config = yield* DisReactConfig;

  const cache = yield* C.makeWith({
    timeToLive,
    capacity: config.dokenCapacity,
    lookup  : (id: string): E.Effect<Doken.Active | undefined, DokenError> =>
      pipe(
        dynamo.get({
          TableName: process.env.DDB_OPERATIONS,
          Key      : {
            pk: `t-${id}`,
            sk: `t-${id}`,
          },
        }),
        E.catchAll((e) => new DokenMemoryError(e)),
        E.map((resp) => resp.Item as Doken.Active | undefined),
      ),
  });

  return DokenMemory.make({
    load: (id: string): E.Effect<Doken.Active | undefined, DokenError> => cache.get(id),

    save: (doken: Doken.Active): E.Effect<void, DokenError> =>
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
        E.tap(() => cache.set(doken.id, doken)),
      ),

    free: (id: string): E.Effect<void, DokenError> =>
      pipe(
        dynamo.delete({
          TableName: process.env.DDB_OPERATIONS,
          Key      : {
            pk: `t-${id}`,
            sk: `t-${id}`,
          },
        }),
        E.catchAll((e) => new DokenMemoryError(e)),
        E.tap(() => cache.invalidate(id)),
      ),
  });
});
