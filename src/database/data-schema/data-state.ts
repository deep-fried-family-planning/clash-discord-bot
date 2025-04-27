import {asKey, asLatest} from '#src/database/data-arch/codec-standard.ts';
import {Id} from '#src/database/data-arch/id.ts';
import {DataTag} from '#src/database/data-const/index.ts';
import {S} from '#src/internal/pure/effect.ts';

export const Key = asKey(
  DataTag.DATA_STATE,
  Id.NowSk as unknown as S.Schema<string, string>,
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
