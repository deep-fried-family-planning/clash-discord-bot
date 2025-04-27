import {asKey, asLatest, TimeToLive} from '#src/database/data-arch/codec-standard.ts';
import {Id} from '#src/database/data-arch/id.ts';
import {DataTag} from '#src/database/data-const/index.ts';
import {S} from '#src/internal/pure/effect.ts';
import {Duration} from 'effect';

export const Key = asKey(
  DataTag.INVOKE,
  Id.ComputeName,
  Id.DateTimeSk,
  0,
);

export const Latest = asLatest(Key, {
  instance: S.String,
  ttl     : S.optional(TimeToLive(Duration.days(28))),
});

export const Versions = Latest;
