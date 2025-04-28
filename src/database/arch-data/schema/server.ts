import {DataTag} from '#src/database/arch-data/constants/index.ts';
import {Id} from '#src/database/arch-data/id.ts';
import {asKey, asLatest, toLatest} from '#src/database/arch-data/standard.ts';
import {DiscordServer} from '#src/internal/discord-old/dynamo/schema/discord-server.ts';
import {S} from '#src/internal/pure/effect.ts';
import {DateTime} from 'effect';

export const Key = asKey(
  DataTag.SERVER,
  Id.ServerId,
  Id.NowSk,
  0,
);

export const Latest = asLatest(Key, {
  gsi_all_server_id: Id.ServerId,
  forum            : S.optional(Id.ChannelId),
  raids            : S.optional(Id.ThreadId),
  admin            : Id.RoleId,
  polling          : S.Boolean,
});
export type Latest = typeof Latest.Type;

export const Versions = S.Union(
  Latest,
  toLatest(Latest, DiscordServer, (enc) => {
    return {
      _tag             : Key._tag,
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
