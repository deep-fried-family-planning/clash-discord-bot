
import {DokenMemoryError} from '#src/disreact/codec/error.ts';
import type * as Doken from '#src/disreact/codec/wire/abstract/doken.ts';
import {DsxSettings} from '#src/disreact/interface/DisReactConfig.ts';
import {C, DR, DT, E, L, OPT} from '#src/internal/pure/effect.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Cache, type Cause, Exit, pipe} from 'effect';



export type DokenError =
  | DokenMemoryError
  | Cause.UnknownException;



export class DokenMem extends E.Service<DokenMem>()('disreact/DokenMemory', {
  accessors: true,

  effect: E.gen(function* () {
    const config = yield* DsxSettings;
    const lookup = (_: string) => E.succeed(undefined as Doken.MaybeDefer);
    const cache = yield* Cache.makeWith({
      capacity: config.doken.capacity ?? 100,
      timeToLive,
      lookup,
    });

    return {
      save: (doken: Doken.Defer) => cache.set(doken.id, doken) as E.Effect<void, Doken.Err>,
      load: (id: string) => cache.get(id) as E.Effect<Doken.MaybeDefer, Doken.Err>,
      free: (id: string) => cache.invalidate(id) as E.Effect<void, Doken.Err>,
    };
  }),
}) {
  static readonly DynamoLive = pipe(
    L.effect(this, E.suspend(() => makeDynamo)),
    L.provide(DynamoDBDocument.defaultLayer),
  );
}

const makeDynamo = E.gen(function* () {
  const dynamo = yield* DynamoDBDocument;
  const config = yield* DsxSettings;

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
    capacity: config.doken.capacity ?? 100,
    timeToLive,
  });

  return DokenMem.make({
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
  });
});

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
