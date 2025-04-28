import {DataTag} from '#src/database/data/const/index.ts';
import {Id} from '#src/database/data/schema/id.ts';
import {declareKey, declareLatest, transformLatest} from '#src/database/data/arch.ts';
import {DiscordUser} from '#src/internal/discord-old/dynamo/schema/discord-user.ts';
import {S} from '#src/internal/pure/effect.ts';
import {DateTime} from 'effect';

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
