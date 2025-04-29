import {CapacityLimiter} from '#src/database/service/CapacityLimiter.ts';
import type {DeleteCommandInput, GetCommandInput, PutCommandInput, QueryCommandInput, ScanCommandInput, UpdateCommandInput} from '@aws-sdk/lib-dynamodb';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import * as Cache from 'effect/Cache';
import * as Duration from 'effect/Duration';
import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import {pipe} from 'effect/Function';
import {Codec} from '../data';

type With<A> = A & {codec: Codec};

export class DeepFryerDocument extends Effect.Service<DeepFryerDocument>()('deepfryer/DeepFryerDocument', {
  effect: Effect.gen(function* () {
    const document = yield* DynamoDBDocument;
    const capacity = yield* CapacityLimiter;
    const table = process.env.DDB_OPERATIONS;

    const records = yield* Cache.makeWith({
      capacity  : 1000,
      timeToLive: Exit.match({
        onSuccess: () => Duration.minutes(3),
        onFailure: () => Duration.zero,
      }),
      lookup: (key: string) => {
        const [TableName, pk, sk, _tag] = key.split('/');
        const codec = Codec.TagMap[_tag as keyof typeof Codec.TagMap] as unknown as Codec | undefined;

        return pipe(
          document.get({
            TableName: TableName,
            Key      : {pk, sk},
          }),
          capacity.estimateReadUnits(codec?.RCU),
          Effect.map((res) => res.Item),
        );
      },
    });

    const set = (tableName: string, item: any) => {
      const {pk, sk, _tag} = item;
      return records.set(`${tableName}/${pk}/${sk}/${_tag}`, item);
    };

    const invalidate = (tableName: string, pk: string, sk: string, _tag: string) =>
      records.invalidate(`${tableName}/${pk}/${sk}/${_tag}`);

    const put = ({codec, ...cmd}: With<PutCommandInput>) =>
      pipe(
        document.put({
          ...cmd,
          TableName: cmd.TableName ?? table,
        }),
        capacity.encodedWriteUnits(cmd.Item),
        Effect.tap(() => set(cmd.TableName ?? table, cmd.Item!)),
      );

    const get = ({codec, ...cmd}: With<GetCommandInput>) =>
      pipe(
        document.get({
          ...cmd,
          TableName: cmd.TableName ?? table,
        }),
        capacity.estimateReadUnits(codec.RCU),
      );

    const getCached = ({codec, ...cmd}: With<GetCommandInput>) => {
      const {pk, sk} = cmd.Key!;
      const {_tag} = codec;
      return records.get(`${cmd.TableName ?? table}/${pk}/${sk}/${_tag}`);
    };

    const update = ({codec, ...cmd}: With<UpdateCommandInput>) =>
      pipe(
        document.update({
          ...cmd,
          TableName: cmd.TableName ?? table,
        }),
        capacity.estimateWriteUnits(codec.WCU),
        Effect.tap(() => {
          const {pk, sk} = cmd.Key!;
          return invalidate(cmd.TableName ?? table, pk, sk, codec._tag);
        }),
      );

    const $delete = ({codec, ...cmd}: With<DeleteCommandInput>) =>
      pipe(
        document.delete({
          ...cmd,
          TableName: cmd.TableName ?? table,
        }),
        capacity.estimateWriteUnits(codec.WCU),
        Effect.tap(() => {
          const {pk, sk} = cmd.Key!;
          return invalidate(cmd.TableName ?? table, pk, sk, codec._tag);
        }),
      );

    const getPartition = (cmd: QueryCommandInput) =>
      pipe(
        document.query({
          ...cmd,
          TableName: cmd.TableName ?? table,
        }),
        capacity.partitionReadUnits,
        Effect.map((res) => res.Items ?? []),
      );

    const query = (cmd: QueryCommandInput) =>
      pipe(
        document.query({
          ...cmd,
          TableName: cmd.TableName ?? table,
        }),
        capacity.partitionReadUnits,
        Effect.map((res) => res.Items),
      );

    const scan = (cmd: ScanCommandInput) =>
      pipe(
        document.scan({
          ...cmd,
          TableName: cmd.TableName ?? table,
        }),
        capacity.indexReadUnits,
        Effect.map((res) => res.Items),
      );

    return {
      set,
      invalidate,
      put,
      get,
      getCached,
      update,
      delete: $delete,
      getPartition,
      query,
      scan,
    };
  }),
  accessors: true,
}) {}
