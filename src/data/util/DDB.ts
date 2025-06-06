import {DataClient} from '#src/service/DataClient.ts';
import type {DeleteCommandInput, GetCommandInput, GetCommandOutput, QueryCommandInput, QueryCommandOutput, ScanCommandInput, ScanCommandOutput, UpdateCommandInput} from '@aws-sdk/lib-dynamodb';
import type * as Cause from 'effect/Cause';
import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import type * as ParseResult from 'effect/ParseResult';
import * as S from 'effect/Schema';

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

export class DataDecodeError extends Data.TaggedError('DataDecodeError')<{
  cause: ParseResult.ParseError | Cause.Cause<Error>;
}> {}

export class DataEncodeError extends Data.TaggedError('DataInputError')<{
  cause: ParseResult.ParseError | Cause.Cause<Error>;
}> {}

export const PutBaseInput = S.Struct({
  TableName: S.optional(S.String),
  Item     : S.Any,
});

export const PutBaseOutput = S.Struct({
  ConsumedCapacity: S.optional(S.Any),
});

type AnyItem = Record<string, any>;

export const Put = <A, I extends AnyItem, R>(i: S.Schema<A, I, R>) => {
  const encodeItem = S.encode(i);
  return (input: A) =>
    pipe(
      encodeItem(input),
      E.catchTag('ParseError', (cause) => new DataEncodeError({cause})),
      E.flatMap((item) => DataClient.put({Item: item})),
    );
};

export const GetBaseInput = S.Struct({
  TableName: S.optional(S.String),
  Key      : S.Any,
});

export const GetBaseOutput = S.Struct({
  Item: S.optional(S.Any),
});

export const GetExpression = <A, I, R, A2, I2, R2>(
  i: S.Schema<A, I, R>,
  o: S.Schema<A2, I2, R2>,
  t: (i: I) => Partial<GetCommandInput>,
) => {
  const encodeKey = S.encode(i);
  const decodeItem = S.decode(o);
  return (input: A) =>
    pipe(
      encodeKey(input),
      E.map((enc) => t(enc)),
      E.catchAllCause((cause) => new DataEncodeError({cause})),
      E.flatMap((cmd) => DataClient.get(cmd)),
      E.flatMap((res) => !res.Item ? E.succeed(undefined) : decodeItem(res.Item as any)),
      E.catchTag('ParseError', (cause) => new DataDecodeError({cause})),
    );
};

export const GetV1 = <A, I, R, A2, I2, R2>(key: S.Schema<A, I, R>, item: S.Schema<A2, I2, R2>) => {
  const encodeKey = S.encode(key);
  const decodeItem = S.decode(item);

  return (input: Omit<GetCommandInput, 'Key'> & {Key: A}) =>
    pipe(
      encodeKey(input.Key),
      E.flatMap((a) =>
        DataClient.get({
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

export const GetUpgradeV1 = <A, I, R, A2, I2, R2>(key: S.Schema<A, I, R>, out: S.Schema<A2, I2, R2>) => {
  const encodeKey = S.encode(key);
  const decodeOut = S.decode(out);
  const encodeOut = S.encode(out);

  return (input: Omit<Partial<GetCommandInput>, 'Key'> & {Key: A}) =>
    pipe(
      encodeKey(input.Key),
      E.flatMap((a) =>
        DataClient.get({
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
          DataClient.put({
            TableName: input.TableName,
            Item     : noUndefinedAtEncode(encoded) as any,
          }),
        ));
      }),
    );
};

export const UpdateBaseInput = S.Struct({
  TableName       : S.optional(S.String),
  Key             : S.Any,
  UpdateExpression: S.Any,
});

export const UpdateBaseOutput = S.Struct({
  Attributes      : S.optional(S.Any),
  ConsumedCapacity: S.optional(S.Any),
});

export const Update = <A, I, R>(key: S.Schema<A, I, R>) => {
  const encodeKey = S.encode(key);

  return (input: Omit<UpdateCommandInput, 'Key'> & {Key: A}) =>
    pipe(
      encodeKey(input.Key),
      E.flatMap((a) =>
        DataClient.update({
          ...input,
          Key: a as any,
        }),
      ),
    );
};

export const DeleteBaseInput = S.Struct({
  TableName: S.optional(S.String),
  Key      : S.Any,
});

export const DeleteBaseOutput = S.Struct({
  Attributes      : S.optional(S.Any),
  ConsumedCapacity: S.optional(S.Any),
});

export const Delete = <A, I, R>(key: S.Schema<A, I, R>) => {
  const encodeKey = S.encode(key);

  return (input: Omit<Partial<DeleteCommandInput>, 'Key'> & {Key: A}) =>
    pipe(
      encodeKey(input.Key),
      E.flatMap((a) =>
        DataClient.delete({
          ...input,
          Key: a as any,
        }),
      ),
    );
};

export const QueryBaseInput = S.Struct({
  TableName             : S.optional(S.String),
  KeyConditionExpression: S.Any,
});

export const QueryBaseOutput = S.Struct({
  Items           : S.optional(S.Array(S.Any)),
  LastEvaluatedKey: S.optional(S.Any),
  ConsumedCapacity: S.optional(S.Any),
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
        DataClient.query({...input, ...a} as any),
      ),
      E.flatMap((res) => {
        if (!res.Items) {
          return E.succeed({...res, Items: [] as unknown as A2} as Omit<QueryCommandOutput, 'Items'> & {Items: A2});
        }
        return decodeOutput(res.Items as any).pipe(E.map((items) => ({...res, Items: items} as Omit<QueryCommandOutput, 'Items'> & {Items: A2})));
      }),
    );
};

export const QueryV2 = <A, I, R, A2, R2>(
  o: S.Schema<A2, any, R2>,
  i: S.Schema<A, I, R>,
  c: (e: I) => Partial<QueryCommandInput>,
) => {
  const encode = S.encode(i);
  const decode = S.decode(S.Array(o));

  return (input: A) => encode(input).pipe(
    E.flatMap((query) => DataClient.query(c(query))),
    E.flatMap((res) =>
      decode(res.Items ?? []).pipe(
        E.map((Items) => ({
          ...res,
          Items,
        })),
      ),
    ),
  );
};

export const ScanV2 = <A, I, R, A2, R2>(
  o: S.Schema<A2, any, R2>,
  i: S.Schema<A, I, R>,
  c: (e: I) => Partial<ScanCommandInput>,
) => {
  const encode = S.encode(i);
  const decode = S.decode(S.Array(o));

  return (input: A) => encode(input).pipe(
    E.flatMap((scan) => DataClient.scan(c(scan))),
    E.flatMap((res) =>
      decode(res.Items ?? []).pipe(
        E.map((Items) => ({
          ...res,
          Items,
        })),
      ),
    ),
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
                DataClient.put({
                  TableName: input.TableName,
                  Item     : noUndefinedAtEncode(out) as any,
                }),
              )),
            ),
        ));
      }),
    );
};

export const ScanBaseInput = S.Struct({
  TableName        : S.optional(S.String),
  ExclusiveStartKey: S.optional(S.Any),
});

export const ScanBaseOutput = S.Struct({
  Items           : S.optional(S.Array(S.Any)),
  LastEvaluatedKey: S.optional(S.Any),
  ConsumedCapacity: S.optional(S.Any),
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
        DataClient.query({...input, ...a}),
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
            DataClient.put({
              TableName: input.TableName,
              Item     : noUndefinedAtEncode(out) as any,
            }),
          )),
        ),
    ));
  }));
};
