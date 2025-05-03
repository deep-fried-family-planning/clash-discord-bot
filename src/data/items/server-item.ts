import {DataTag} from '#src/data/constants/index.ts';
import {Id} from '#src/database/arch/id.ts';
import {DiscordServer} from '#src/database/data/deprecated.ts';
import {S} from '#src/internal/pure/effect.ts';
import {decodeOnly, decodeOrFail} from '#src/util/util-schema.ts';
import {DateTime} from 'effect';
import {DocumentSchema, IdSchema, ItemSchema} from '../arch';

export const ServerItemLatest = S.Struct({
  _tag             : S.tag(DataTag.SERVER),
  version          : S.tag(0),
  pk               : IdSchema.ServerId.Forward,
  sk               : IdSchema.NowSk,
  gsi_all_server_id: Id.ServerId,
  forum            : S.optional(Id.ChannelId),
  raids            : S.optional(Id.ThreadId),
  admin            : Id.RoleId,
  created          : ItemSchema.Created,
  updated          : ItemSchema.Updated,
  upgraded         : ItemSchema.Upgraded,
});

export const ServerItemVersions = S.Union(
  ServerItemLatest,
  decodeOnly(DiscordServer, S.typeSchema(ServerItemLatest), (fromA) => {
    return {
      _tag             : DataTag.SERVER,
      version          : 0,
      upgraded         : true,
      pk               : fromA.pk,
      sk               : fromA.sk,
      gsi_all_server_id: fromA.pk,
      created          : DateTime.unsafeMake(fromA.created),
      updated          : DateTime.unsafeMake(fromA.updated),
      forum            : fromA.forum,
      raids            : fromA.raids,
      admin            : fromA.admin,
    } as const;
  }),
);

export const makeServerItem = ServerItemLatest.make;

export const putServerItem = S.encode(
  DocumentSchema.PutItem(ServerItemLatest),
);

export const getServerItem = S.decode(
  decodeOrFail(
    DocumentSchema.GetItem(
      S.Struct({
        pk: IdSchema.ServerId.Reverse,
        sk: IdSchema.NowSk,
      }),
      ServerItemVersions,
    ),
    S.typeSchema(ServerItemVersions),
    (input) => {
      if (input.Item?.upgraded) {

      }
      return E;
    },
  ),
);

export const deleteServerItem = S.encode(
  DocumentSchema.DeleteItem(
    S.Struct({
      pk: IdSchema.ServerId.Forward,
      sk: IdSchema.NowSk,
    }),
  ),
);
