import {DocumentDecodeItemError, DocumentEncodeInputError, DocumentEncodeItemError, isUpgraded, noUndefinedEncoded} from '#src/data/arch/util-document.ts';
import {DeepFryerDB} from '#src/data/service/DeepFryerDB.ts';
import type {DeleteCommandInput, GetCommandInput, GetCommandOutput, PutCommandInput, QueryCommandInput, QueryCommandOutput, ScanCommandInput, ScanCommandOutput, UpdateCommandInput} from '@aws-sdk/lib-dynamodb';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as S from 'effect/Schema';

export const PutBaseInput = S.Struct({
  TableName: S.optional(S.String),
  Item     : S.Any,
});

export const PutBaseOutput = S.Struct({
  ConsumedCapacity: S.optional(S.Any),
});

export const Put = <A, I, R>(item: S.Schema<A, I, R>) => {
  const encodeItem = S.encode(item);

  return (input: Omit<Partial<PutCommandInput>, 'Item'> & {Item: A}) =>
    pipe(
      encodeItem(input.Item),
      E.catchAll((cause) => new DocumentEncodeItemError({cause})),
      E.flatMap((item) =>
        DeepFryerDB.put({
          ...input,
          Item: noUndefinedEncoded(item) as any,
        }),
      ),
    );
};

export const GetBaseInput = S.Struct({
  TableName: S.optional(S.String),
  Key      : S.Any,
});

export const GetBaseOutput = S.Struct({
  Item: S.optional(S.Any),
});

export const Get = <A, I, R, A2, I2, R2>(key: S.Schema<A, I, R>, item: S.Schema<A2, I2, R2>) => {
  const encodeKey = S.encode(key);
  const decodeItem = S.decode(item);

  return (input: Omit<GetCommandInput, 'Key'> & {Key: A}) =>
    pipe(
      encodeKey(input.Key),
      E.catchAll((cause) => new DocumentEncodeInputError({cause})),
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
        return pipe(
          decodeItem(res.Item as any),
          E.catchAll((cause) => new DocumentDecodeItemError({cause})),
          E.map((item) => ({...res, Item: item} as Omit<GetCommandOutput, 'Item'> & {Item: undefined | A2})),
        );
      }),
    );
};

export const GetUpgrade = <A, I, R, A2, I2, R2>(key: S.Schema<A, I, R>, item: S.Schema<A2, I2, R2>) => {
  const get = Get(key, item);
  const encodeItem = S.encode(item);

  return (input: Omit<Partial<GetCommandInput>, 'Key'> & {Key: A}) =>
    pipe(
      get(input as any),
      E.tap((res) => {
        if (!isUpgraded(res.Item)) {
          return E.void;
        }
        return pipe(
          encodeItem(res.Item!),
          E.catchAll((cause) => new DocumentEncodeItemError({cause})),
          E.flatMap((encoded) =>
            DeepFryerDB.put({
              TableName: input.TableName,
              Item     : noUndefinedEncoded(encoded) as any,
            }),
          ),
        );
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
      E.catchAll((cause) => new DocumentEncodeInputError({cause})),
      E.flatMap((a) =>
        DeepFryerDB.update({
          ...input,
          Key: a as any,
        }),
      ),
    );
};

export const UpdateSet = <A, I, R>(key: S.Schema<A, I, R>) => {
  const encodeKey = S.encode(key);

  return (input: Omit<UpdateCommandInput, 'Key'> & {Key: A}) =>
    pipe(
      encodeKey(input.Key),
      E.catchAll((cause) => new DocumentEncodeInputError({cause})),
      E.flatMap((a) =>
        DeepFryerDB.update({
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
      E.catchAll((cause) => new DocumentEncodeInputError({cause})),
      E.flatMap((a) =>
        DeepFryerDB.delete({
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
      E.catchAll((cause) => new DocumentEncodeInputError({cause})),
      E.flatMap((a) =>
        DeepFryerDB.query({
          ...input,
          ...a,
        } as any),
      ),
      E.flatMap((res) => {
        if (!res.Items) {
          return E.succeed({
            ...res,
            Items: [] as unknown as A2,
          } as Omit<QueryCommandOutput, 'Items'> & {Items: A2});
        }
        return pipe(
          decodeOutput(res.Items as any),
          E.catchAll((cause) => new DocumentDecodeItemError({cause})),
          E.map((items) => ({
            ...res,
            Items: items,
          } as Omit<QueryCommandOutput, 'Items'> & {Items: A2})),
        );
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
            .filter((item) => isUpgraded(item))
            .map((item) =>
              pipe(
                encodeOutput(item as any),
                E.catchAll((cause) => new DocumentEncodeItemError({cause})),
                E.flatMap((out) =>
                  DeepFryerDB.put({
                    TableName: input.TableName,
                    Item     : noUndefinedEncoded(out) as any,
                  }),
                ),
              ),
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
      E.catchAll((cause) => new DocumentEncodeInputError({cause})),
      E.flatMap((a) =>
        DeepFryerDB.query({...input, ...a}),
      ),
      E.flatMap((res) => {
        if (!res.Items) {
          return E.succeed({
            ...res,
            Items: [] as unknown as A2,
          } as Omit<ScanCommandOutput, 'Items'> & {Items: A2});
        }
        return pipe(
          decodeOutput(res.Items as any),
          E.catchAll((cause) => new DocumentDecodeItemError({cause})),
          E.map((items) => ({
            ...res,
            Items: items,
          } as Omit<ScanCommandOutput, 'Items'> & {Items: A2})),
        );
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
        .filter((item) => isUpgraded(item))
        .map((item) =>
          pipe(
            encodeOutput(item as any),
            E.catchAll((cause) => new DocumentEncodeItemError({cause})),
            E.flatMap((out) =>
              DeepFryerDB.put({
                TableName: input.TableName,
                Item     : noUndefinedEncoded(out) as any,
              }),
            ),
          ),
        ),
    ));
  }));
};
