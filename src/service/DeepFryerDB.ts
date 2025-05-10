import {DynamoEnv} from '#config/aws.ts';
import {DeepFryerDBCapacity} from '#src/service/DeepFryerDBCapacity.ts';
import type {BatchWriteCommandInput, DeleteCommandInput, GetCommandInput, PutCommandInput, QueryCommandInput, UpdateCommandInput} from '@aws-sdk/lib-dynamodb';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import * as E from 'effect/Effect';

export class DeepFryerDB extends E.Service<DeepFryerDB>()('deepfryer/DB', {
  effect: E.gen(function* () {
    const env = yield* DynamoEnv;
    const document = yield* DynamoDBDocument;
    const capacity = yield* DeepFryerDBCapacity;

    return {
      put: (cmd: Partial<PutCommandInput>) =>
        document.put(
          {
            ...cmd,
            TableName: cmd.TableName ?? env.DFFP_DDB_TABLE,
          } as any,
        ).pipe(
          capacity.encodedWriteUnits(cmd.Item),
        ),

      get: (cmd: Partial<GetCommandInput>) =>
        document.get(
          {
            ...cmd,
            TableName: cmd.TableName ?? env.DFFP_DDB_TABLE,
          } as any,
        ).pipe(
          capacity.readLimiter,
        ),

      update: (cmd: Partial<UpdateCommandInput>) =>
        document.update(
          {
            ...cmd,
            TableName: cmd.TableName ?? env.DFFP_DDB_TABLE,
          } as any,
        ).pipe(
          capacity.writeLimiter,
        ),

      delete: (cmd: Partial<DeleteCommandInput>) =>
        document.delete(
          {
            ...cmd,
            TableName: cmd.TableName ?? env.DFFP_DDB_TABLE,
          } as any,
        ).pipe(
          capacity.writeLimiter,
        ),

      query: (cmd: Partial<QueryCommandInput>) =>
        document.query(
          {
            ...cmd,
            TableName: cmd.TableName ?? env.DFFP_DDB_TABLE,
          } as any,
        ).pipe(
          capacity.readLimiter,
        ),

      scan: (cmd: Partial<QueryCommandInput>) =>
        document.scan(
          {
            ...cmd,
            TableName: cmd.TableName ?? env.DFFP_DDB_TABLE,
          } as any,
        ).pipe(
          capacity.readLimiter,
        ),

      batchPut: (cmd: Omit<Partial<BatchWriteCommandInput>, 'RequestItems'> & {TableName?: string | undefined; Items: any[]}) =>
        document.batchWrite({
          ...cmd,
          RequestItems: {
            [cmd.TableName ?? env.DFFP_DDB_TABLE]: cmd.Items.map((item) => ({
              PutRequest: {
                Item: item,
              },
            })),
          },
        }).pipe(
          capacity.estimateWriteUnits(cmd.Items.length),
        ),
    };
  }),
  dependencies: [
    DynamoDBDocument.defaultLayer,
    DeepFryerDBCapacity.Default,
  ],
  accessors: true,
}) {}
