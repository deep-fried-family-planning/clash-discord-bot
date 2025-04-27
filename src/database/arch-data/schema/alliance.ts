import {asKey, asLatest} from '#src/database/arch-data/standard.ts';
import {Id} from '#src/database/arch-data/id.ts';
import {DataTag} from '#src/database/arch-data/constants/index.ts';
import {S} from '#src/internal/pure/effect.ts';

export const Key = asKey(
  DataTag.ALLIANCE,
  Id.AllianceId,
  Id.NowSk,
  0,
);

export const Latest = asLatest(Key, {
  name   : S.String,
  servers: S.Record({
    key  : S.typeSchema(Id.ServerId),
    value: S.Struct({}),
  }),
});

export const Versions = S.Union(
  Latest,
);
