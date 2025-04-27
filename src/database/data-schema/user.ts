import {asKey, asLatest, toLatest} from '#src/database/data-arch/codec-standard.ts';
import {Id} from '#src/database/data-arch/id.ts';
import {DataTag} from '#src/database/data-const/index.ts';
import {DiscordUser} from '#src/dynamo/schema/discord-user.ts';
import {S} from '#src/internal/pure/effect.ts';
import {DateTime} from 'effect';

export const Key = asKey(
  DataTag.USER,
  Id.UserId,
  Id.NowSk,
  0,
);

export const Latest = asLatest(Key, {
  gsi_all_user_id: Id.UserId,
  timezone       : S.TimeZone,
});

export const Versions = S.Union(
  Latest,
  toLatest(Latest, DiscordUser, (enc) => {
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
