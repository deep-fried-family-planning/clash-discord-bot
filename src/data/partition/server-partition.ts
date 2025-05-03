import {Server, ServerClan, ServerInfo} from '#src/database/arch/codec.ts';
import {ServerId} from '#src/database/arch/id.ts';
import { pipe } from 'effect/Function';
import * as DocumentSchema from '#src/data/arch/DocumentSchema.ts';
import * as S from 'effect/Schema';

export const ServerPartition = pipe(
  DocumentSchema.QueryPartition(
    ServerId,
    S.Union(
      Server.Schema,
      ServerClan.Schema,
      ServerInfo.Schema,
    ),
  ),
);
