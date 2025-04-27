import {asKey, asLatest, ClanVerification, SelectMetadata, toLatest} from '#src/database/data-arch/codec-standard.ts';
import {Id} from '#src/database/data-arch/id.ts';
import {DataTag} from '#src/database/data-const/index.ts';
import {DiscordClan} from '#src/dynamo/schema/discord-clan.ts';
import {S} from '#src/internal/pure/effect.ts';
import {DateTime} from 'effect';

export const Key = asKey(
  DataTag.SERVER_CLAN,
  Id.ServerId,
  Id.ClanTag,
  0,
);

export const Latest = asLatest(Key, {
  gsi_server_id  : Id.ServerId,
  gsi_clan_tag   : Id.ClanTag,
  thread_prep    : Id.ThreadId,
  prep_opponent  : Id.ClanTag,
  thread_battle  : Id.ThreadId,
  battle_opponent: Id.ClanTag,
  countdown      : Id.ThreadId,
  verification   : S.optionalWith(ClanVerification, {default: () => 0}),
  select         : S.optional(SelectMetadata(Id.ClanTag)),
});

export const Versions = S.Union(
  Latest,
  toLatest(Latest, DiscordClan, (enc) => {
    return {
      _tag           : Key._tag,
      version        : Key.latest,
      upgraded       : true,
      pk             : enc.pk,
      sk             : enc.sk,
      gsi_server_id  : enc.gsi_server_id,
      gsi_clan_tag   : enc.gsi_clan_tag,
      thread_prep    : enc.thread_prep,
      prep_opponent  : enc.prep_opponent,
      thread_battle  : enc.thread_battle,
      battle_opponent: enc.battle_opponent,
      countdown      : enc.countdown,
      verification   : enc.verification as any,
      created        : DateTime.unsafeMake(enc.created),
      updated        : DateTime.unsafeMake(enc.updated),
    } as const;
  }),
);
