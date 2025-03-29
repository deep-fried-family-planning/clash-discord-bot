/* eslint-disable @typescript-eslint/unbound-method */
import {C, E, L, S} from '#src/internal/pure/effect.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {DateTime, Exit, pipe} from 'effect';
import {satisfies} from 'effect/Function';

const RestCacheKey = S.Struct(
  {
    pk: S.Literal('RestCache'),
    sk: S.String,
  },
);

const RestCacheData = S.TaggedStruct(
  'RestCacheData',
  {
    ...RestCacheKey.fields,
    ttl : S.DateTimeUtcFromNumber,
    data: S.Any,
  },
);

const RestCacheDataOrUndefined = S.Union(
  RestCacheData,
  S.Undefined,
);

type RestCacheData = typeof RestCacheData.Type;
type RestCacheDataOrUndefined = typeof RestCacheDataOrUndefined.Type;


const encodeRestCacheData = S.encodeSync(RestCacheData);
const decodeRestCacheData = S.decodeUnknownSync(RestCacheDataOrUndefined);


type IRestCache = {
  set: (key: string, data: any) => E.Effect<void>;
  get: (key: string) => E.Effect<RestCacheDataOrUndefined>;
};

export class RestCache extends E.Tag('DeepFryer.RestCache')<RestCache, IRestCache>() {
  static readonly Live = L.suspend(() => L.effect(this, make));
}



const make = E.gen(function* () {
  const dynamo = yield* DynamoDBDocument;

  const cache = yield* C.makeWith({
    capacity  : 1000,
    timeToLive: (exit) =>
      pipe(
        exit,
        Exit.match({
          onFailure: () => '0 minutes',
          onSuccess: (cached) => {
            if (!cached) return '0 minutes';
            const now       = E.runSync(DateTime.now);
            const remaining = DateTime.distanceDuration(now, cached.ttl);
            return remaining;
          },
        }),
      ),
    lookup: (key: string) =>
      pipe(
        dynamo.get({
          TableName: process.env.DDB_OPERATIONS,
          Key      : RestCacheKey.make({pk: 'RestCache', sk: key}),
        }),
        E.catchAll(() => E.succeed(undefined)),
        E.map((output) => {
          if (!output) return undefined;
          return decodeRestCacheData(output.Item);
        }),
      ),
  });


  const set = (key: string, data: any) =>
    pipe(
      // E.as(DateTime.now),
      // E.flatten,
      DateTime.now,
      E.flatMap((time) => {
        const encode = {
          pk : 'RestCache',
          sk : key,
          ttl: DateTime.add(time, {
            minutes: 4,
          }),
          data: data,
          _tag: 'RestCacheData',
        } as const;
        return pipe(
          dynamo.put({

            TableName: process.env.DDB_OPERATIONS,
            Item     : encodeRestCacheData(encode),
          }),
          E.tap(() => cache.set(key, encode)),
        );
      }),
      E.ignore,
      E.fork,
      E.asVoid,
    );

  return {
    set: set,
    get: cache.get,
  };
});
