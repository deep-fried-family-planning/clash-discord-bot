import {DeepFryerDocument} from '#src/database/DeepFryerDocument.ts';
import type {QueryCommandInput, ScanCommandInput} from '@aws-sdk/lib-dynamodb';
import * as Chunk from 'effect/Chunk';
import * as Effect from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';

export class DeepFryerPage extends Effect.Service<DeepFryerPage>()('deepfryer/DeepFryerPage', {
  effect: Effect.gen(function* () {
    const document = yield* DeepFryerDocument;

    const pageQuery = (cmd: Partial<QueryCommandInput>) => Stream.paginateChunkEffect(
      undefined as Record<string, any> | undefined,
      (key) =>
        pipe(
          document.query({
            ...cmd,
            ExclusiveStartKey: key,
          }),
          Effect.map((res) => [
            Chunk.fromIterable(res.Items!),
            Option.fromNullable(res.LastEvaluatedKey),
          ]),
        ),
    );

    const pageScan = (cmd: Partial<ScanCommandInput>) => Stream.paginateChunkEffect(
      undefined as Record<string, any> | undefined,
      (key) =>
        pipe(
          document.scan({
            ...cmd,
            ExclusiveStartKey: key,
          }),
          Effect.map((res) => [
            Chunk.fromIterable(res.Items!),
            Option.fromNullable(res.LastEvaluatedKey),
          ]),
        ),
    );

    return {
      pageQuery,
      pageScan,
    };
  }),
  accessors: true,
}) {}
