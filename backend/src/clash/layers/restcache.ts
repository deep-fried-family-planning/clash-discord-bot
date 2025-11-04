import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import * as C from 'effect/Cache';
import * as DateTime from 'effect/DateTime';
import * as E from 'effect/Effect';
import * as Exit from 'effect/Exit';
import {pipe} from 'effect/Function';
import * as L from 'effect/Layer';
import * as S from 'effect/Schema';

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
            const now = E.runSync(DateTime.now);
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
