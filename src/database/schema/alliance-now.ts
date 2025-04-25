import {asLatest} from '#src/database/arch/arch.ts';
import {PkSk, DataTag} from '#src/database/arch/index.ts';
import {S} from '#src/internal/pure/effect.ts';
import {asKey} from '#src/database/arch/arch.ts';

export const Key = asKey(
  DataTag.ALLIANCE,
  PkSk.AllianceId,
  PkSk.NowSk,
  0,
);

export const Latest = asLatest(Key, {
  name   : S.String,
  servers: S.Map({
    key  : PkSk.ServerId,
    value: S.Struct({}),
  }),
});

export const Versions = S.Union(
  Latest,
);
