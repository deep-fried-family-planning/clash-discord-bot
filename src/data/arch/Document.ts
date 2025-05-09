import {DeepFryerDB} from '#src/data/arch/DeepFryerDB.ts';
import {DOCUMENT_RESERVED} from '#src/data/constants/document-reserved.ts';
import type {DeleteCommandInput, GetCommandInput, GetCommandOutput, PutCommandInput, QueryCommandInput, QueryCommandOutput, ScanCommandInput, ScanCommandOutput, UpdateCommandInput} from '@aws-sdk/lib-dynamodb';
import {decode, encode} from '@msgpack/msgpack';
import {DateTime, type Duration} from 'effect';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as S from 'effect/Schema';
import {deflate, inflate} from 'pako';

export const Created = S.transformOrFail(
  S.DateTimeUtc,
  S.UndefinedOr(S.DateTimeUtcFromSelf),
  {
    decode: (dt) => E.succeed(dt),
    encode: (dt) => dt ? E.succeed(dt) : DateTime.now,
  },
);

export const Updated = S.transformOrFail(
  S.DateTimeUtc,
  S.UndefinedOr(S.DateTimeUtcFromSelf),
  {
    decode: (dt) => E.succeed(dt),
    encode: () => DateTime.now,
  },
);

export const Upgraded = pipe(
  S.Union(S.Undefined, S.Boolean),
  S.transform(
    S.Union(S.Undefined, S.Boolean),
    {
      decode: (enc) => enc,
      encode: () => undefined,
    },
  ),
  S.optional,
);

export const TimeToLive = (duration: Duration.Duration) =>
  S.transformOrFail(
    S.DateTimeUtcFromNumber,
    S.UndefinedOr(S.DateTimeUtcFromSelf),
    {
      decode: (dt) => E.succeed(dt),
      encode: (dt) => dt
        ? E.succeed(dt)
        : pipe(
          DateTime.now,
          E.map(
            DateTime.addDuration(duration),
          ),
        ),
    },
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
  S.transform(S.String, schema, {
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
  });

const isDocumentReserved = (key: string) => {
  return DOCUMENT_RESERVED[key.toUpperCase()] === 0;
};

export const Item = <F extends S.Struct.Fields>(fields: F) => {
  if (process.env.NODE_ENV !== 'production') {
    for (const k of Object.keys(fields)) {
      if (isDocumentReserved(k)) {
        throw new Error(`Reserved field ${k}`);
      }
    }
  }
  return S.Struct(fields);
};

export const Put = <A, I, R>(item: S.Schema<A, I, R>) => {
  const encodeItem = S.encode(item);

  return (input: Omit<PutCommandInput, 'Item'> & {Item: A}) =>
    pipe(
      encodeItem(input.Item),
      E.flatMap((item) =>
        DeepFryerDB.put({
          ...input,
          Item: item as any,
        }),
      ),
    );
};

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

  return (input: Omit<DeleteCommandInput, 'Key'> & {Key: A}) =>
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

export const Query = <
  A extends { [K in keyof QueryCommandInput]?: any }, I extends Partial<QueryCommandInput>, R,
  A2 extends readonly unknown[], I2 extends readonly unknown[], R2,
>(
  condition: S.Schema<A, I, R>,
  output: S.Schema<A2, I2, R2>,
) => {
  const encodeCondition = S.encode(condition);
  const decodeOutput = S.decode(output);

  return (input: Omit<QueryCommandInput, keyof A> & { [K in keyof A]: A[K] }) =>
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

  return (input: Omit<QueryCommandInput, keyof A> & { [K in keyof A]: A[K] }) =>
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
  }));
};
