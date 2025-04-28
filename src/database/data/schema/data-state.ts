import {DataTag} from '#src/database/data/const/index.ts';
import {Id} from '#src/database/data/schema/id.ts';
import {declareKey, declareLatest} from '#src/database/data/arch.ts';
import {S} from '#src/internal/pure/effect.ts';

export const Key = declareKey(
  DataTag.DATA_STATE,
  Id.NowSk,
  Id.NowSk,
  0,
);

export const Latest = declareLatest(Key, {
  servers: S.Int.pipe(S.positive()),
  clans  : S.Int.pipe(S.positive()),
  users  : S.Int.pipe(S.positive()),
  players: S.Int.pipe(S.positive()),
});

export const Versions = S.Union(
  Latest,
);
