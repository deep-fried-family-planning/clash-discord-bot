import {DataTag} from '#src/database/arch-data/constants/index.ts';
import {Id} from '#src/database/arch-data/id.ts';
import {asKey, asLatest} from '#src/database/arch-data/standard.ts';
import {TimeToLive} from '#src/database/arch-data/util.ts';
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
