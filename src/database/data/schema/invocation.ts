import {DataTag} from '#src/database/data/const/index.ts';
import {Id} from '#src/database/data/schema/id.ts';
import {declareKey, declareLatest} from '#src/database/data/arch.ts';
import {TimeToLive} from '#src/database/data/schema/common.ts';
import {S} from '#src/internal/pure/effect.ts';
import {Duration} from 'effect';

export const Key = declareKey(
  DataTag.INVOKE,
  Id.ComputeName,
  Id.DateTimeSk,
  0,
);

export const Latest = declareLatest(Key, {
  instance: S.String,
  ttl     : S.optional(TimeToLive(Duration.days(28))),
});

export const Versions = Latest;
