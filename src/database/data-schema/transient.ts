import {asKey, asLatest, CompressedBinary, TimeToLive} from '#src/database/data-arch/codec-standard.ts';
import {Id} from '#src/database/data-arch/id.ts';
import {DataTag} from '#src/database/data-const/index.ts';
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
