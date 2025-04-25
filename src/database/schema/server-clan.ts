import {asKey, asLatest, ClanVerification, SelectMetadata, toLatest} from '#src/database/arch/arch.ts';
import {PkSk, DataTag} from '#src/database/arch/index.ts';
import {DiscordClan} from '#src/dynamo/schema/discord-clan';
import {S} from '#src/internal/pure/effect.ts';
import {DateTime} from 'effect';

export const Key = asKey(
  DataTag.SERVER_CLAN,
  PkSk.ServerId,
  PkSk.ClanTag,
  0,
);

export const Latest = asLatest(Key, {
  gsi_server_id  : PkSk.ServerId,
  gsi_clan_tag   : PkSk.ClanTag,
  thread_prep    : PkSk.ThreadId,
  prep_opponent  : PkSk.ClanTag,
  thread_battle  : PkSk.ThreadId,
  battle_opponent: PkSk.ClanTag,
  countdown      : PkSk.ThreadId,
  verification   : S.optionalWith(ClanVerification, {default: () => 0}),
  select         : S.optional(SelectMetadata(PkSk.ClanTag)),
});

export const Versions = S.Union(
  Latest,
  toLatest(Latest, DiscordClan, (enc) => {
    return {
      _tag           : Key.tag,
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
