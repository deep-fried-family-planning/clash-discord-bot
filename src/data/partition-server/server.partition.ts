import * as Document from '#src/data/arch/Document.ts';
import * as IdSchema from '#src/data/arch/Id.ts';
import * as Table from '#src/data/arch/Table.ts';
import * as ServerClan from '#src/data/partition-server/server-clan.ts';
import * as ServerInfo from '#src/data/partition-server/server-info.ts';
import * as Server from '#src/data/partition-server/server.ts';
import * as UserServerLink from '#src/data/partition-user/user-link.ts';
import {encodeOnly} from '#src/util/util-schema.ts';
import * as Record from 'effect/Record';
import * as S from 'effect/Schema';
import * as E from 'effect/Effect';

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
    Document.QueryBaseInput,
    (input) => ({
      KeyConditionExpression   : 'pk = :pk',
      ExpressionAttributeValues: Record.mapKeys(input.KeyConditionExpression, (k) => `:${k}`),
    }),
  ),
  Items,
);

export const scanUp = E.fn('ServerPartition.scanUp')(function* (serverId: string) {

});

export const scanDown = E.fn('ServerPartition.scanDown')(function* (serverId: string) {

});
