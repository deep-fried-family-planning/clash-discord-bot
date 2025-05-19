import {DynamoEnv} from '#config/aws.ts';
import {DataCapacity} from '#src/service/DataCapacity.ts';
import type {DeleteCommandInput, GetCommandInput, PutCommandInput, QueryCommandInput, ScanCommandInput, UpdateCommandInput} from '@aws-sdk/lib-dynamodb';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

export class DataClient extends E.Service<DataClient>()('deepfryer/DataClient', {
  effect: E.gen(function* () {
    const env = yield* DynamoEnv;
    const document = yield* DynamoDBDocument;
    const capacity = yield* DataCapacity;

    const withTable = (cmd: any): any => ({
      ...cmd,
      TableName: cmd.TableName ?? env.DFFP_DDB_TABLE,
    });

    return {
      put: (cmd: Partial<PutCommandInput>) =>
        pipe(
          E.logTrace('DataClient: Put', cmd),
          E.andThen(document.put(withTable(cmd))),
          capacity.encodedWriteUnits(cmd.Item),
        ),
      get: (cmd: Partial<GetCommandInput>) =>
        pipe(
          E.logTrace('DataClient: Get', cmd),
          E.andThen(document.get(withTable(cmd))),
          capacity.readLimiter,
        ),
      update: (cmd: Partial<UpdateCommandInput>) =>
        pipe(
          E.logTrace('DataClient: Update', cmd),
          E.andThen(document.update(withTable(cmd))),
          capacity.writeLimiter,
        ),
      delete: (cmd: Partial<DeleteCommandInput>) =>
        pipe(
          E.logTrace('DataClient: Delete', cmd),
          E.andThen(document.delete(withTable(cmd))),
          capacity.writeLimiter,
        ),
      query: (cmd: Partial<QueryCommandInput>) =>
        pipe(
          E.logTrace('DataClient: Query', cmd),
          E.andThen(document.query(withTable(cmd))),
          capacity.readLimiter,
        ),
      scan: (cmd: Partial<ScanCommandInput>) =>
        pipe(
          E.logTrace('DataClient: Scan', cmd),
          E.andThen(document.scan(withTable(cmd))),
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
