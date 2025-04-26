import {asKey, asLatest, toLatest} from '#src/database/setup/arch.ts';
import {DiscordUser} from '#src/dynamo/schema/discord-user';
import {S} from '#src/internal/pure/effect.ts';
import {DateTime} from 'effect';
import {PkSk, DataTag} from '#src/database/setup/index.ts';

export const Key = asKey(
  DataTag.USER,
  PkSk.UserId,
  PkSk.NowSk,
  0,
);

export const Latest = asLatest(Key, {
  gsi_all_user_id: PkSk.UserId,
  timezone       : S.TimeZone,
});

export const Versions = S.Union(
  Latest,
  toLatest(Latest, DiscordUser, (enc) => {
    return {
      _tag           : Key.tag,
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
