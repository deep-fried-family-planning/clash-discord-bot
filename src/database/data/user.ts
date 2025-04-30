import {DataTag} from '#src/database/arch/const/index.ts';
import {Id} from '#src/database/arch/id.ts';
import {declareKey, declareLatest, transformLatest} from '#src/database/arch/arch.ts';
import {DiscordUser} from '#src/database/data/deprecated.ts';
import {S} from '#src/internal/pure/effect.ts';
import {DateTime} from 'effect';
import * as Arbitrary from 'effect/Arbitrary';
import * as FastCheck from 'effect/FastCheck';

export const Key = declareKey(
  DataTag.USER,
  Id.UserId,
  Id.NowSk,
  0,
);

export const Latest = declareLatest(Key, {
  gsi_all_user_id: Id.UserId,
  timezone       : S.TimeZone,
});

export const Versions = S.Union(
  Latest,
  transformLatest(Latest, DiscordUser, (enc) => {
    return {
      _tag           : Key._tag,
      version        : Key.latest,
      upgraded       : true,
      pk             : enc.pk,
      sk             : enc.sk,
      gsi_all_user_id: enc.pk,
      created        : DateTime.unsafeMake(enc.created),
      updated        : DateTime.unsafeMake(enc.updated),
      timezone       : enc.timezone,
    } as const;
  }),
);

//
// const arb = Arbitrary.make(Versions);
//
// console.log(FastCheck.sample(arb, 2));
