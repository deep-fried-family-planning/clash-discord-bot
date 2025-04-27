import {DataTag} from '#src/database/arch-data/constants/index.ts';
import {Id} from '#src/database/arch-data/id.ts';
import {asKey, asLatest} from '#src/database/arch-data/standard.ts';
import {CompressedBinary, TimeToLive} from '#src/database/arch-data/util.ts';
import {S} from '#src/internal/pure/effect.ts';
import {Duration} from 'effect';

export const Key = asKey(
  DataTag.TRANSIENT,
  Id.TransientUrl,
  Id.NowSk,
  0,
);

export const Latest = asLatest(Key, {
  _key: S.String,
  api : S.String,
  bin : CompressedBinary(S.Any),
  ttl : TimeToLive(Duration.minutes(3)),
});

export const Versions = Latest;
