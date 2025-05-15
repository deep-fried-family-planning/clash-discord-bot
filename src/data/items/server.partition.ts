import * as Document from '#src/data/arch/Document.ts';
import * as IdSchema from '#src/data/arch/Id.ts';
import * as Table from '#src/data/arch/Table.ts';
import * as ServerClan from '#src/data/items/server-clan.ts';
import * as ServerInfo from '#src/data/items/server-info.ts';
import * as Server from '#src/data/items/server.ts';
import * as UserServerLink from '#src/data/items/user-link.ts';
import {encodeOnly} from '#src/util/util-schema.ts';
import * as Record from 'effect/Record';
import * as S from 'effect/Schema';

export const Key = Table.Key({
  pk: IdSchema.ServerId,
});

export const Items = S.Array(S.Union(
  Server.Versions,
  ServerClan.Versions,
  ServerInfo.Versions,
  UserServerLink.Versions,
));

export const scan = Document.QueryUpgrade(
  encodeOnly(
    S.Struct({
      KeyConditionExpression: Key,
    }),
    S.Struct({
      KeyConditionExpression   : S.String,
      ExpressionAttributeValues: S.Any,
    }),
    (input) => ({
      KeyConditionExpression   : 'pk = :pk',
      ExpressionAttributeValues: Record.mapKeys(input.KeyConditionExpression, (k) => `:${k}`),
    }),
  ),
  Items,
);

export type Type = typeof Items.Type;
