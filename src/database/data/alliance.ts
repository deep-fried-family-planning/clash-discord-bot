import {DataTag} from '#src/database/arch/const/index.ts';
import {Id} from '#src/database/arch/id.ts';
import {declareKey, declareLatest} from '#src/database/arch/arch.ts';
import {S} from '#src/internal/pure/effect.ts';

export const Key = declareKey(
  DataTag.ALLIANCE,
  Id.AllianceId,
  Id.NowSk,
  0,
);

export const Latest = declareLatest(Key, {
  name   : S.String,
  servers: S.Record({
    key  : S.typeSchema(Id.ServerId),
    value: S.Struct({}),
  }),
});

export const Versions = S.Union(
  Latest,
);
