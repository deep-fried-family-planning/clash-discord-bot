import {decodeOrFail, encodeOrFail} from '#src/util/util-schema.ts';
import {DynamoDBDocument, type DynamoDBDocumentService} from '@effect-aws/lib-dynamodb';
import * as Array from 'effect/Array';
import type * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as Record from 'effect/Record';
import * as S from 'effect/Schema';

export const Key = <Name, A, I, R>(name: Name, key: S.Schema<A, I, R>) =>
  ({
    name: name,
    key : key,
  });

export const Composite = <Partition extends ReturnType<typeof Key>, Sort extends ReturnType<typeof Key>>(
  partition: Partition,
  sort: Sort,
) =>
  ({
    pk: partition,
    sk: sort,
  });

export const PutItemInput = S.Struct({
  TableName: S.optional(S.String),
  Item     : S.Any,
});

export const PutItem = <A, I, R>(item: S.Schema<A, I, R>) =>
  encodeOrFail(
    S.Struct({
      TableName: S.String,
      Item     : item,
    }),
    S.Struct({}),
    (input) =>
      DynamoDBDocument.put(input as any) as any,
  );

export const GetItem = <A, I, R, A2, I2, R2>(key: S.Schema<A, I, R>, output: S.Schema<A2, I2, R2>) =>
  decodeOrFail(
    S.Struct({
      TableName     : S.String,
      Key           : key,
      ConsistentRead: S.optional(S.Boolean),
    }),
    S.Struct({
      Item: S.optional(output),
    }),
    (input) =>
      DynamoDBDocument.get(input as any) as any,
  );

export const UpdateItem = <A, I, R, A2, R2, A3, I3, R3>(key: S.Schema<A, I, R>, expression: S.Schema<A2, string, R2>, values: S.Schema<A3, I3, R3>) =>
  encodeOrFail(
    S.Struct({
      TableName                : S.String,
      Key                      : key,
      UpdateExpression         : expression,
      ExpressionAttributeValues: values,
    }),
    S.Struct({}),
    (input) =>
      DynamoDBDocument.update(input as any) as any,
  );

export const UpdateItemSet = <A, I, R, A2, I2, R2>(key: S.Schema<A, I, R>, updates: S.Schema<A2, I2, R2>) =>
  encodeOrFail(
    S.Struct({
      TableName: S.String,
      Key      : key,
      Set      : S.partial(updates),
    }),
    S.Struct({}),
    ({Set, ...input}) =>
      DynamoDBDocument.update({
        ...input,
        TableName                : input.TableName,
        Key                      : input.Key as any,
        ExpressionAttributeValues: Record.mapKeys(Set, (k) => `:${k}`),
        UpdateExpression         : pipe(
          Set,
          Record.map((v, k) => `${k} = :${k}`),
          Record.values,
          Array.join(' AND '),
        ),
      }),
  );

export const DeleteItem = <A, I, R>(key: S.Schema<A, I, R>) =>
  encodeOrFail(
    S.Struct({
      TableName: S.String,
      Key      : key,
    }),
    S.Struct({}),
    (input) =>
      DynamoDBDocument.update({
        ...input,
        TableName: input.TableName,
        Key      : input.Key as any,
      }) as any,
  );

export type QueryError = E.Effect.Error<ReturnType<typeof DynamoDBDocument.query>>;

export const QueryInput = S.Struct({
  TableName                : S.optional(S.String),
  IndexName                : S.optional(S.String),
  Select                   : S.optional(S.Any),
  Limit                    : S.optional(S.Number),
  ConsistentRead           : S.optional(S.Boolean),
  ScanIndexForward         : S.optional(S.Boolean),
  ExclusiveStartKey        : S.optional(S.Any),
  ReturnConsumedCapacity   : S.optional(S.Any),
  ProjectionExpression     : S.optional(S.String),
  FilterExpression         : S.optional(S.String),
  KeyConditionExpression   : S.optional(S.String),
  ExpressionAttributeNames : S.optional(S.Record({key: S.String, value: S.String})),
  ExpressionAttributeValues: S.optional(S.Record({key: S.String, value: S.Any})),
});

export const QueryOutput = <A, I, R>(output: S.Schema<A, I, R>) =>
  S.Struct({
    Items           : S.Array(output).pipe(S.optionalWith({default: () => []})),
    Count           : S.optional(S.Number),
    ScannedCount    : S.optional(S.Number),
    LastEvaluatedKey: S.optional(S.Any),
    ConsumedCapacity: S.optional(S.Any),
  });

export type QueryOutput<A extends S.Schema.Any> =
  ReturnType<
    typeof QueryOutput<
      S.Schema.Type<A>,
      S.Schema.Encoded<A>,
      S.Schema.Context<A>
    >
  >['Encoded'];

export const Query = <I, R, A2, I2, R2>(expression: S.Schema<string, I, R>, output: S.Schema<A2, I2, R2>) =>
  decodeOrFail(
    S.Struct({
      ...QueryInput.fields,
      KeyConditionExpression: expression,
    }),
    QueryOutput(output),
    (input) =>
      DynamoDBDocument.query(input as any) as E.Effect<QueryOutput<typeof output>, QueryError, DynamoDBDocumentService>,
  );

export const QueryPartition = <A, I, R, A2, I2, R2>(pk: S.Schema<A, I, R>, output: S.Schema<A2, I2, R2>) =>
  decodeOrFail(
    S.Struct({
      ...QueryInput.fields,
      PartitionKey: pk,
    }),
    QueryOutput(output),
    ({PartitionKey, ...input}) =>
      DynamoDBDocument.query({
        ...input,
        TableName                : input.TableName,
        KeyConditionExpression   : 'pk = :pk',
        ExpressionAttributeValues: {':pk': PartitionKey},
      }) as E.Effect<QueryOutput<typeof output>, QueryError, DynamoDBDocumentService>,
  );

export type ScanError = E.Effect.Error<ReturnType<typeof DynamoDBDocument.scan>>;

export const ScanInput = S.Struct({
  TableName                : S.optional(S.String),
  IndexName                : S.optional(S.String),
  Select                   : S.optional(S.Any),
  ExclusiveStartKey        : S.optional(S.Any),
  Limit                    : S.optional(S.Number),
  TotalSegments            : S.optional(S.Number),
  Segment                  : S.optional(S.Number),
  ReturnConsumedCapacity   : S.optional(S.Any),
  ProjectionExpression     : S.optional(S.String),
  FilterExpression         : S.optional(S.String),
  ExpressionAttributeNames : S.optional(S.Record({key: S.String, value: S.String})),
  ExpressionAttributeValues: S.optional(S.Record({key: S.String, value: S.Any})),
  ConsistentRead           : S.optional(S.Boolean),
});

export type ScanInput = typeof ScanInput.Type;

export const ScanOutput = <A, I, R>(output: S.Schema<A, I, R>) =>
  S.Struct({
    Items           : S.Array(output).pipe(S.optionalWith({default: () => []})),
    LastEvaluatedKey: S.optional(S.Any),
  });

export type ScanOutput<A extends S.Schema.Any> =
  ReturnType<
    typeof ScanOutput<
      S.Schema.Type<A>,
      S.Schema.Encoded<A>,
      S.Schema.Context<A>
    >
  >['Encoded'];

export const Scan = <A, I, R, A2, I2, R2>(output: S.Schema<A2, I2, R2>) =>
  decodeOrFail(
    ScanInput,
    ScanOutput(output),
    (input) =>
      DynamoDBDocument.scan(input as any) as E.Effect<ScanOutput<typeof output>, ScanError, DynamoDBDocumentService>,
  );

export const ScanIndex = <Idx, A, I, R>(index: Idx, output: S.Schema<A, I, R>) =>
  decodeOrFail(
    ScanInput,
    ScanOutput(output),
    (input) =>
      DynamoDBDocument.scan({
        ...input,
        TableName: input.TableName,
        IndexName: index as any,
      }) as E.Effect<ScanOutput<typeof output>, ScanError, DynamoDBDocumentService>,
  );
