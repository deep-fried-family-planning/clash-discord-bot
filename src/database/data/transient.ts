import {DataTag} from '#src/database/arch/const/index.ts';
import {Id} from '#src/database/arch/id.ts';
import {declareKey, declareLatest} from '#src/database/arch/arch.ts';
import {CompressedBinary, TimeToLive} from '#src/database/arch/common.ts';
import {S} from '#src/internal/pure/effect.ts';
import {Duration} from 'effect';

export const Key = declareKey(
  DataTag.TRANSIENT,
  Id.TransientUrl,
  Id.NowSk,
  0,
);

export const Latest = declareLatest(Key, {
  _key: S.String,
  api : S.String,
  bin : CompressedBinary(S.Any),
  ttl : TimeToLive(Duration.minutes(3)),
});

export const Versions = Latest;
