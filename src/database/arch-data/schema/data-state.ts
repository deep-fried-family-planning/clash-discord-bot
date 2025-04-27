import {asKey, asLatest} from '#src/database/arch-data/standard.ts';
import {Id} from '#src/database/arch-data/id.ts';
import {DataTag} from '#src/database/arch-data/constants/index.ts';
import {S} from '#src/internal/pure/effect.ts';

export const Key = asKey(
  DataTag.DATA_STATE,
  Id.NowSk,
  Id.NowSk,
  0,
);

export const Latest = asLatest(Key, {
  servers: S.Int.pipe(S.positive()),
  clans  : S.Int.pipe(S.positive()),
  users  : S.Int.pipe(S.positive()),
  players: S.Int.pipe(S.positive()),
});

export const Versions = S.Union(
  Latest,
);
