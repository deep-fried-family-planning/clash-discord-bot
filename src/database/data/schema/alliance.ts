import {DataTag} from '#src/database/data/const/index.ts';
import {Id} from '#src/database/data/schema/id.ts';
import {declareKey, declareLatest} from '#src/database/data/arch.ts';
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
