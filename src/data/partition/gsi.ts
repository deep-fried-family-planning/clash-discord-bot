import {Server, ServerClan, User} from '#src/database/arch/codec.ts';
import * as DocumentSchema from '#src/data/arch/DocumentSchema.ts';
import {decodeOrFail} from '#src/util/util-schema.ts';
import {DynamoDBDocument, type DynamoDBDocumentService} from '@effect-aws/lib-dynamodb';
import type * as E from 'effect/Effect';
import * as S from 'effect/Schema';

const ScanGSI = <Idx, A, I, R>(index: Idx, output: S.Schema<A, I, R>) =>
  decodeOrFail(
    DocumentSchema.ScanInput,
    DocumentSchema.ScanOutput(output),
    (input) =>
      DynamoDBDocument.scan(
        {
          ...input,
          TableName: input.TableName,
          IndexName: index as any,
        },
      ) as E.Effect<ScanOutput<typeof output>, ScanError, DynamoDBDocumentService>,
  );

const QueryGSI = <Idx, A, I, R>(index: Idx, output: S.Schema<A, I, R>) =>
  decodeOrFail(
    S.Struct({
      ...DocumentSchema.QueryInput.fields,
      IndexName: index as any,

    }),
    DocumentSchema.QueryOutput(output),
    (input) =>
      DynamoDBDocument.query(),
  );

export const scanServerGSI = S.decode(
  DocumentSchema.ScanIndex(
    'GSI_ALL_SERVERS',
    Server.Schema,
  ),
);

export const queryServerGSI = S.decode(
  DocumentSchema.QueryGSI(
    'GSI_ALL_SERVERS',
    Server.Schema,
  ),
);

export const scanUserGSI = S.decode(
  ScanGSI(
    'GSI_ALL_USERS',
    User.Schema,
  ),
);

export const scanClanGSI = S.decode(
  ScanGSI(
    'GSI_ALL_CLANS',
    ServerClan.Schema,
  ),
);
