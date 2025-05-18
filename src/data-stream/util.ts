import type {ServerClan} from '#src/data/index.ts';
import type {CreateScheduleCommandInput} from '@aws-sdk/client-scheduler';
import type {DeleteCommandInput, PutCommandInput, TransactWriteCommandInput, UpdateCommandInput} from '@aws-sdk/lib-dynamodb';
import type {ClanWar} from 'clashofclans.js';
import * as Data from 'effect/Data';

export type Terminal = Data.TaggedEnum<{
  Delete       : DeleteCommandInput;
  Put          : PutCommandInput;
  Update       : UpdateCommandInput;
  TransactWrite: TransactWriteCommandInput;
  Schedule     : CreateScheduleCommandInput;
}>;

export const Terminal = Data.taggedEnum<Terminal>();
