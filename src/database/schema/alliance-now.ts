import {asLatest} from '#src/database/arch-schema/arch.ts';
import {PkSk, DataTag} from '#src/database/arch-schema/index.ts';
import {S} from '#src/internal/pure/effect.ts';
import {asKey} from '#src/database/arch-schema/arch.ts';

export const Key = asKey(
  DataTag.ALLIANCE,
  PkSk.AllianceId,
  PkSk.NowSk,
  0,
);

export const Latest = asLatest(Key, {
  name   : S.String,
  servers: S.Record({
    key  : S.typeSchema(PkSk.ServerId),
    value: S.Struct({}),
  }),
});

export const Versions = S.Union(
  Latest,
);
