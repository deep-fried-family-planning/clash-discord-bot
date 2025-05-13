import {DynamoEnv} from '#config/aws.ts';
import {DeepFryerDBCapacity} from '#src/data/service/DeepFryerDBCapacity.ts';
import type {DeleteCommandInput, GetCommandInput, PutCommandInput, QueryCommandInput, UpdateCommandInput} from '@aws-sdk/lib-dynamodb';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import * as E from 'effect/Effect';
import * as Data from 'effect/Data';

export class DeepFryerDBError extends Data.TaggedError('DeepFryerDBError')<{
  cause: any;
}> {}

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
          E.catchAll((cause) => new DeepFryerDBError({cause})),
          capacity.encodedWriteUnits(cmd.Item),
        ),

      get: (cmd: Partial<GetCommandInput>) =>
        document.get(
          {
            ...cmd,
            TableName: cmd.TableName ?? env.DFFP_DDB_TABLE,
          } as any,
        ).pipe(
          E.catchAll((cause) => new DeepFryerDBError({cause})),
          capacity.readLimiter,
        ),

      update: (cmd: Partial<UpdateCommandInput>) =>
        document.update(
          {
            ...cmd,
            TableName: cmd.TableName ?? env.DFFP_DDB_TABLE,
          } as any,
        ).pipe(
          E.catchAll((cause) => new DeepFryerDBError({cause})),
          capacity.writeLimiter,
        ),

      delete: (cmd: Partial<DeleteCommandInput>) =>
        document.delete(
          {
            ...cmd,
            TableName: cmd.TableName ?? env.DFFP_DDB_TABLE,
          } as any,
        ).pipe(
          E.catchAll((cause) => new DeepFryerDBError({cause})),
          capacity.writeLimiter,
        ),

      query: (cmd: Partial<QueryCommandInput>) =>
        document.query(
          {
            ...cmd,
            TableName: cmd.TableName ?? env.DFFP_DDB_TABLE,
          } as any,
        ).pipe(
          E.catchAll((cause) => new DeepFryerDBError({cause})),
          capacity.readLimiter,
        ),

      scan: (cmd: Partial<QueryCommandInput>) =>
        document.scan(
          {
            ...cmd,
            TableName: cmd.TableName ?? env.DFFP_DDB_TABLE,
          } as any,
        ).pipe(
          E.catchAll((cause) => new DeepFryerDBError({cause})),
          capacity.readLimiter,
        ),
    };
  }),
  dependencies: [
    DynamoDBDocument.defaultLayer,
    DeepFryerDBCapacity.Default,
  ],
  accessors: true,
}) {}
