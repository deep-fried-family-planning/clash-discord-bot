import {DynamoEnv} from '#config/aws.ts';
import {DataCapacity} from '#src/data/service/DataCapacity.ts';
import type {DeleteCommandInput, GetCommandInput, PutCommandInput, QueryCommandInput, UpdateCommandInput} from '@aws-sdk/lib-dynamodb';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import * as E from 'effect/Effect';

export class DataClient extends E.Service<DataClient>()('deepfryer/DataClient', {
  effect: E.gen(function* () {
    const env = yield* DynamoEnv;
    const document = yield* DynamoDBDocument;
    const capacity = yield* DataCapacity;

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
    };
  }),
  dependencies: [
    DynamoDBDocument.defaultLayer,
    DataCapacity.Default,
  ],
  accessors: true,
}) {}
