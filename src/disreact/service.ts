import {Doken, Rest} from '#src/disreact/codec/schema/rest/index.ts';
import {DokenMemoryError} from '#src/disreact/error.ts';
import {C, E, L, LG, LL, RDT} from '#src/internal/pure/effect.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {DiscordREST} from 'dfx';
import type {DiscordRESTError} from 'dfx/DiscordREST';
import {type Cause, Duration, Exit, pipe} from 'effect';



export class DiscordDOM extends E.Tag('DisReact.DiscordDOM')<
  DiscordDOM,
  {
    discard : (d: Doken.Type) => E.Effect<void, DiscordRESTError>;
    defer   : (d: Doken.Type) => E.Effect<void, DiscordRESTError>;
    create  : (d: Doken.Type, encoded: any) => E.Effect<void, DiscordRESTError>;
    reply   : (d: Doken.Type, encoded: any) => E.Effect<void, DiscordRESTError>;
    update  : (d: Doken.Type, encoded: any) => E.Effect<void, DiscordRESTError>;
    dismount: (d: Doken.Type) => E.Effect<void, DiscordRESTError>;
  }
>() {
  static readonly defaultLayer = L.suspend(() => makeDfx);
}

const makeDfx = L.effect(DiscordDOM, E.gen(function* () {
  const REST = yield* DiscordREST;

  return {
    discard: (d) =>
      pipe(
        REST.createInteractionResponse(
          d.id,
          RDT.value(d.token!),
          {type: Rest.DEFER_UPDATE},
        ),
        E.provide(LG.minimumLogLevel(LL.Info)),
      ),

    defer: (d) =>
      pipe(
        REST.createInteractionResponse(
          d.id,
          RDT.value(d.token!),
          d.ephemeral
            ? {type: d.type, data: {flags: Rest.EPHEMERAL}}
            : {type: d.type},
        ),
        E.provide(LG.minimumLogLevel(LL.Info)),
      ),

    create: (d, data) =>
      pipe(
        REST.createInteractionResponse(
          d.id,
          RDT.value(d.token!),
          {type: d.type, data},
        ),
        E.provide(LG.minimumLogLevel(LL.Info)),
      ),

    reply: (d, data) =>
      pipe(
        REST.editOriginalInteractionResponse(
          d.app_id!,
          RDT.value(d.token!),
          data,
        ),
        E.provide(LG.minimumLogLevel(LL.Info)),
      ),

    update: (d, data) =>
      pipe(
        REST.editOriginalInteractionResponse(
          d.app_id!,
          RDT.value(d.token!),
          data,
        ),
        E.provide(LG.minimumLogLevel(LL.Info)),
      ),

    dismount: (d) =>
      pipe(
        REST.deleteOriginalInteractionResponse(
          d.app_id!,
          RDT.value(d.token!),
        ),
        E.provide(LG.minimumLogLevel(LL.Info)),
      ),
  };
}));



type DokenMemoryKind =
  | 'local'
  | 'dynamo'
  | 'custom';

type DokenError =
  | DokenMemoryError
  | Cause.UnknownException;

export class DokenMemory extends E.Tag('DisReact.DokenMemory')<
  DokenMemory,
  {
    kind   : DokenMemoryKind;
    load   : (id: string) => E.Effect<Doken.Type | null, DokenError>;
    memLoad: (id: string) => E.Effect<Doken.Type | null, DokenError>;
    free   : (id: string) => E.Effect<void, DokenError>;
    memFree: (id: string) => E.Effect<void, DokenError>;
    save   : (d: Doken.Type) => E.Effect<void, DokenError>;
    memSave: (d: Doken.Type) => E.Effect<void, DokenError>;
  }
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
    lookup    : () => E.succeed(null as null | Doken.Type),
  });

  return {
    kind   : 'local' as const,
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
        E.flatMap((resp) => resp.Item
          ? Doken.makeFromParams(resp.Item as any)
          : E.succeed(null),
        ),
      ),
    timeToLive: (exit) =>
      Exit.match(
        exit,
        {
          onFailure: () => Duration.millis(0),
          onSuccess: (d) => !d
            ? Duration.millis(0)
            : Duration.minutes(5),
        },
      ),
    capacity: 1000,
  });

  return {
    kind: 'dynamo' as const,
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
