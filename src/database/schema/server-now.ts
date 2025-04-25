import {asKey, asLatest, toLatest} from '#src/database/arch/arch.ts';
import {PkSk, DataTag} from '#src/database/arch/index.ts';
import {DiscordServer} from '#src/dynamo/schema/discord-server.ts';
import {S} from '#src/internal/pure/effect.ts';
import {DateTime} from 'effect';

export const Key = asKey(
  DataTag.SERVER,
  PkSk.ServerId,
  PkSk.NowSk,
  0,
);

export const Latest = asLatest(Key, {
  gsi_all_server_id: PkSk.ServerId,
  forum            : S.optional(PkSk.ChannelId),
  raids            : S.optional(PkSk.ThreadId),
  admin            : PkSk.RoleId,
  polling          : S.Boolean,
});
export type Latest = typeof Latest.Type;

export const Versions = S.Union(
  Latest,
  toLatest(Latest, DiscordServer, (enc) => {
    return {
      _tag             : Key.tag,
      version          : Key.latest,
      upgraded         : true,
      pk               : enc.pk,
      sk               : enc.sk,
      gsi_all_server_id: enc.pk,
      created          : DateTime.unsafeMake(enc.created),
      updated          : DateTime.unsafeMake(enc.updated),
      forum            : enc.forum,
      raids            : enc.raids,
      admin            : enc.admin,
      polling          : enc.polling,
    } as const;
  }),
);
