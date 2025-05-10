import {DOCUMENT_RESERVED} from '#src/data/constants/document-reserved.ts';
import {DeepFryerDB} from '#src/service/DeepFryerDB.ts';
import type {DeleteCommandInput, GetCommandInput, GetCommandOutput, PutCommandInput, QueryCommandInput, QueryCommandOutput, ScanCommandInput, ScanCommandOutput, UpdateCommandInput} from '@aws-sdk/lib-dynamodb';
import {decode, encode} from '@msgpack/msgpack';
import {DateTimes, GetRandomValues, makeUuid7, Uuid7State} from '@typed/id';
import * as DateTime from 'effect/DateTime';
import type * as Duration from 'effect/Duration';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as S from 'effect/Schema';
import {deflate, inflate} from 'pako';

export const PartitionKey = <A extends string, I extends string, R>(key: S.Schema<A, I, R>) =>
  key.pipe(
    S.length({min: 1, max: 2048}),
  );

export const AppendedPartitionKey = <A extends string, I extends string, R>(key: S.Schema<A, I, R>, append: string) =>
  S.transform(
    S.String.pipe(S.endsWith(append)),
    PartitionKey(key),
    {
      strict: false,
      decode: (fromA) => fromA.substring(0, -append.length),
      encode: (toI) => `${toI}${append}`,
    },
  );

export const SortKey = <A extends string, I extends string, R>(key: S.Schema<A, I, R>) =>
  key.pipe(
    S.length({min: 1, max: 1024}),
  );

export const PrependedSortKey = <A extends string, I extends string, R>(key: S.Schema<A, I, R>, prepend: string) =>
  S.transform(
    S.String.pipe(S.startsWith(prepend)),
    SortKey(key),
    {
      strict: false,
      decode: (fromA) => fromA.substring(prepend.length),
      encode: (toI) => `${prepend}${toI}`,
    },
  );

export const generateUUIDv7 = pipe(
  makeUuid7,
  E.provide(Uuid7State.Default),
  E.provide([GetRandomValues.CryptoRandom, DateTimes.Default]),
);

export const UUIDv7 = pipe(
  S.UUID,
  S.transformOrFail(
    S.String,
    {
      decode: (fromA) => E.succeed(fromA),
      encode: (toI) => {
        if (toI === '') {
          return generateUUIDv7;
        }
        return E.succeed(toI);
      },
    },
  ),
  S.optionalWith({default: () => ''}),
);

export const Updated = pipe(
  S.DateTimeUtc,
  S.transformOrFail(
    S.DateTimeUtcFromSelf,
    {
      decode: (dt) => E.succeed(dt),
      encode: () => DateTime.now,
    },
  ),
  S.optionalWith({default: () => DateTime.unsafeMake(0)}),
);

export const Upgraded = pipe(
  S.UndefinedOr(S.Boolean),
  S.transform(
    S.UndefinedOr(S.Boolean),
    {
      decode: (enc) => enc,
      encode: () => undefined,
    },
  ),
  S.optionalWith({default: () => undefined}),
);

export const TimeToLive = (duration: Duration.Duration) =>
  pipe(
    S.DateTimeUtcFromNumber,
    S.transformOrFail(
      S.DateTimeUtcFromSelf,
      {
        decode: (dt) => E.succeed(dt),
        encode: (dt) => {
          if (dt.epochMillis !== 0) {
            return E.succeed(dt);
          }
          return DateTime.now.pipe(E.map(DateTime.addDuration(duration)));
        },
      },
    ),
    S.optionalWith({default: () => DateTime.unsafeMake(0)}),
  );

export const SelectData = <A, I, R>(value: S.Schema<A, I, R>) =>
  S.Struct({
    value      : value,
    label      : S.String,
    description: S.optional(S.String),
    default    : S.optional(S.Boolean),
    emoji      : S.optional(S.Struct({
      name: S.String,
    })),
  });

export const CompressedBinary = <A, I, R>(schema: S.Schema<A, I, R>) =>
  S.transform(
    S.String,
    schema,
    {
      decode: (enc) => {
        const buff = Buffer.from(enc, 'base64');
        const pako = inflate(buff);
        return decode(pako) as any;
      },
      encode: (dec) => {
        const pack = encode(dec);
        const pako = deflate(pack);
        return Buffer.from(pako).toString('base64');
      },
    },
  );

const assertDocumentKeys = (obj: object) => {
  if (process.env.NODE_ENV === 'development') {
    for (const key of Object.keys(obj)) {
      if (key.length > 255) throw new Error(`Key ${key} is too long`);
      if (key.toUpperCase() in DOCUMENT_RESERVED) throw new Error(`Reserved field ${key}`);
    }
  }
};

export const Key = <F extends S.Struct.Fields>(fields: F) => {
  assertDocumentKeys(fields);
  return S.Struct(fields);
};

export type AutomaticItem = {
  updated  : DateTime.Utc;
  upgraded?: boolean | undefined;
  v7       : string;
};

export const Version = <
  T extends string,
  K extends S.Struct.Fields,
  F extends S.Struct.Fields,
>(
  tag: T,
  version: number,
  key: S.Struct<K>,
  fields: F,
) => {
  const item = {
    ...fields,
    ...key.fields,
    _tag    : S.tag(tag),
    _ver    : S.tag(version),
    updated : Updated,
    upgraded: Upgraded,
    v7      : UUIDv7,
  };
  assertDocumentKeys(item);
  return S.Struct(item);
};

export const Item = <F extends S.Struct.Fields>(fields: F) => {
  const item = {
    ...fields,
    updated : Updated,
    upgraded: Upgraded,
    v7      : UUIDv7,
  };
  assertDocumentKeys(item);
  return S.Struct(item);
};

export const item = <A>(input: Omit<A, keyof AutomaticItem>): A & AutomaticItem => {
  return {
    ...input,
    updated: undefined,
    v7     : '',
  } as A & AutomaticItem;
};

export const upgrade = <A>(input: Omit<A, keyof AutomaticItem>): A & AutomaticItem => {
  return {
    ...input,
    upgraded: true,
  } as A & AutomaticItem;
};

export const TtlItem = <F extends S.Struct.Fields>(duration: Duration.Duration, fields: F) => {
  const item = {
    ...fields,
    _v7     : UUIDv7,
    updated : Updated,
    upgraded: Upgraded,
    ttl     : TimeToLive(duration),
  };
  assertDocumentKeys(item);
  return S.Struct(item);
};

export const PutInput = S.Struct({
  TableName: S.optional(S.String),
  Item     : S.Any,
});

export const PutOutput = S.Struct({
  Attributes           : S.optional(S.Any),
  ConsumedCapacity     : S.optional(S.Any),
  ItemCollectionMetrics: S.optional(S.Any),
});

export const Put = <A, I, R>(item: S.Schema<A, I, R>) => {
  const encodeItem = S.encode(item);

  return (input: Omit<Partial<PutCommandInput>, 'Item'> & {Item: Omit<A, keyof AutomaticItem> & Partial<AutomaticItem>}) =>
    pipe(
      encodeItem(input.Item as any),
      E.flatMap((item) =>
        DeepFryerDB.put({
          ...input,
          Item: item as any,
        }),
      ),
    );
};

export const GetInput = S.Struct({
  TableName: S.String,
  Key      : S.Any,
});

export const GetOutput = S.Struct({
  Item            : S.optional(S.Any),
  ConsumedCapacity: S.optional(S.Any),
});

export const Get = <A, I, R, A2, I2, R2>(key: S.Schema<A, I, R>, item: S.Schema<A2, I2, R2>) => {
  const encodeKey = S.encode(key);
  const decodeItem = S.decode(item);

  return (input: Omit<GetCommandInput, 'Key'> & {Key: A}) =>
    pipe(
      encodeKey(input.Key),
      E.flatMap((a) =>
        DeepFryerDB.get({
          ...input,
          Key: a as any,
        }),
      ),
      E.flatMap((res) => {
        if (!res.Item) {
          return E.succeed(res as Omit<GetCommandOutput, 'Item'> & {Item: undefined | A2});
        }
        return E.map(
          decodeItem(res.Item as any),
          (item) => ({...res, Item: item} as Omit<GetCommandOutput, 'Item'> & {Item: undefined | A2}),
        );
      }),
    );
};

const noUndefinedAtEncode = <I>(encoded: I) => {
  const enc = {...encoded} as any;
  const acc = {} as any;
  for (const k of Object.keys(encoded as any)) {
    if (enc[k] !== undefined) {
      acc[k] = enc[k];
    }
  }
  return acc as I;
};

export const GetUpgrade = <A, I, R, A2, I2, R2>(key: S.Schema<A, I, R>, out: S.Schema<A2, I2, R2>) => {
  const encodeKey = S.encode(key);
  const decodeOut = S.decode(out);
  const encodeOut = S.encode(out);

  return (input: Omit<Partial<GetCommandInput>, 'Key'> & {Key: A}) =>
    pipe(
      encodeKey(input.Key),
      E.flatMap((a) =>
        DeepFryerDB.get({
          ...input,
          Key: a as any,
        }),
      ),
      E.flatMap((res) => {
        if (!res.Item) {
          return E.succeed(res as Omit<GetCommandOutput, 'Item'> & {Item: undefined | A2});
        }
        return E.map(
          decodeOut(res.Item as any),
          (item) => ({...res, Item: item} as Omit<GetCommandOutput, 'Item'> & {Item: undefined | A2}),
        );
      }),
      E.tap((res) => {
        if (!(res.Item as any)?.upgraded) {
          return E.void;
        }
        return encodeOut(res.Item!).pipe(E.flatMap((encoded) =>
          DeepFryerDB.put({
            TableName: input.TableName,
            Item     : noUndefinedAtEncode(encoded) as any,
          }),
        ));
      }),
    );
};

export const UpdateInput = S.Struct({
  TableName: S.String,
  Key      : S.Any,
});

export const UpdateOutput = S.Struct({
  Item            : S.optional(S.Any),
  ConsumedCapacity: S.optional(S.Any),
});

export const Update = <A, I, R>(key: S.Schema<A, I, R>) => {
  const encodeKey = S.encode(key);

  return (input: Omit<UpdateCommandInput, 'Key'> & {Key: A}) =>
    pipe(
      encodeKey(input.Key),
      E.flatMap((a) =>
        DeepFryerDB.update({
          ...input,
          Key: a as any,
        }),
      ),
    );
};

export const Delete = <A, I, R>(key: S.Schema<A, I, R>) => {
  const encodeKey = S.encode(key);

  return (input: Omit<Partial<DeleteCommandInput>, 'Key'> & {Key: A}) =>
    pipe(
      encodeKey(input.Key),
      E.flatMap((a) =>
        DeepFryerDB.delete({
          ...input,
          Key: a as any,
        }),
      ),
    );
};

export const QueryInput = S.Struct({
  TableName                : S.optional(S.String),
  IndexName                : S.optional(S.String),
  KeyConditionExpression   : S.optional(S.String),
  ExpressionAttributeValues: S.optional(S.Any),
  ExclusiveStartKey        : S.optional(S.Any),
});

export const QueryOutput = S.Struct({
  Items           : S.optional(S.Array(S.Any)),
  LastEvaluatedKey: S.optional(S.Any),
});

export const Query = <
  A extends { [K in keyof QueryCommandInput]?: any }, I extends Partial<QueryCommandInput>, R,
  A2 extends readonly unknown[], I2 extends readonly unknown[], R2,
>(
  condition: S.Schema<A, I, R>,
  output: S.Schema<A2, I2, R2>,
) => {
  const encodeCondition = S.encode(condition);
  const decodeOutput = S.decode(output);

  return (input: Omit<Partial<QueryCommandInput>, keyof A> & { [K in keyof A]: A[K] }) =>
    pipe(
      encodeCondition(input as any),
      E.flatMap((a) =>
        DeepFryerDB.query({...input, ...a} as any),
      ),
      E.flatMap((res) => {
        if (!res.Items) {
          return E.succeed({...res, Items: [] as unknown as A2} as Omit<QueryCommandOutput, 'Items'> & {Items: A2});
        }
        return decodeOutput(res.Items as any).pipe(E.map((items) => ({...res, Items: items} as Omit<QueryCommandOutput, 'Items'> & {Items: A2})));
      }),
    );
};

export const QueryUpgrade = <
  A extends { [K in keyof QueryCommandInput]?: any }, I extends Partial<QueryCommandInput>, R,
  A2 extends readonly unknown[], I2 extends readonly unknown[], R2,
>(
  condition: S.Schema<A, I, R>,
  output: S.Schema<A2, I2, R2>,
) => {
  const query = Query(condition, output);
  const encodeOutput = S.encode(output);

  return (input: Omit<Partial<QueryCommandInput>, keyof A> & { [K in keyof A]: A[K] }) =>
    pipe(
      query(input),
      E.tap((res) => {
        if (!res.Items.length) {
          return E.void;
        }
        return E.fork(E.all(
          res.Items
            .filter((item) => (item as any).upgraded)
            .map((item) =>
              encodeOutput(item as any).pipe(E.flatMap((out) =>
                DeepFryerDB.put({
                  TableName: input.TableName,
                  Item     : noUndefinedAtEncode(out) as any,
                }),
              )),
            ),
        ));
      }),
    );
};

export const ScanInput = S.Struct({
  TableName        : S.optional(S.String),
  IndexName        : S.optional(S.String),
  ExclusiveStartKey: S.optional(S.Any),
});

export const ScanOutput = S.Struct({
  Items           : S.optional(S.Array(S.Any)),
  LastEvaluatedKey: S.optional(S.Any),
});

export const Scan = <
  A extends { [K in keyof ScanCommandInput]?: any }, I extends Partial<ScanCommandInput>, R,
  A2 extends readonly unknown[], I2 extends readonly unknown[], R2,
>(
  condition: S.Schema<A, I, R>,
  output: S.Schema<A2, I2, R2>,
) => {
  const encodeCondition = S.encode(condition);
  const decodeOutput = S.decode(output);

  return (input: ScanCommandInput) =>
    pipe(
      encodeCondition(input as any),
      E.flatMap((a) =>
        DeepFryerDB.query({...input, ...a}),
      ),
      E.flatMap((res) => {
        if (!res.Items) {
          return E.succeed({...res, Items: [] as unknown as A2} as Omit<ScanCommandOutput, 'Items'> & {Items: A2});
        }
        return decodeOutput(res.Items as any).pipe(E.map((items) => ({...res, Items: items} as Omit<ScanCommandOutput, 'Items'> & {Items: A2})));
      }),
    );
};

export const ScanUpgrade = <
  A extends { [K in keyof ScanCommandInput]?: any }, I extends Partial<ScanCommandInput>, R,
  A2 extends readonly unknown[], I2 extends readonly unknown[], R2,
>(
  condition: S.Schema<A, I, R>,
  output: S.Schema<A2, I2, R2>,
) => {
  const scan = Scan(condition, output);
  const encodeOutput = S.encode(output);

  return (input: ScanCommandInput) => scan(input).pipe(E.tap((res) => {
    if (!res.Items.length) {
      return E.void;
    }
    return E.fork(
      E.all(
        res.Items
          .filter((item) => (item as any).upgraded)
          .map((item) =>
            encodeOutput(item as any).pipe(E.flatMap((out) =>
              DeepFryerDB.put({
                TableName: input.TableName,
                Item     : noUndefinedAtEncode(out) as any,
              }),
            )),
          ),
      ),
    );
  }));
};
