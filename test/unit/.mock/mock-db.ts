import {DataClient} from '#src/data/service/DataClient.ts';
import type {DeleteCommandInput, GetCommandInput, PutCommandInput, QueryCommandInput, ScanCommandInput} from '@aws-sdk/lib-dynamodb';
import {vi} from '@effect/vitest';
import * as E from 'effect/Effect';
import * as L from 'effect/Layer';

export const mockDb = {
  get   : vi.fn((cmd: GetCommandInput) => E.succeed({Item: {} as any})),
  put   : vi.fn((cmd: PutCommandInput) => E.void),
  delete: vi.fn((cmd: DeleteCommandInput) => E.void),
  query : vi.fn((cmd: QueryCommandInput) => E.void),
  scan  : vi.fn((cmd: ScanCommandInput) => E.void),
};

export const mockDbLayer = L.succeed(DataClient, DataClient.make(mockDb as any));
