import * as Document from '#src/data/arch/Document.ts';
import * as IdSchema from '#src/data/arch/Id.ts';
import * as ServerAllianceLink from '#src/data/server-alliance-link.ts';
import * as ServerClan from '#src/data/server-clan.ts';
import * as ServerInfo from '#src/data/server-info.ts';
import * as Server from '#src/data/server.ts';
import {encodeOnly} from '#src/util/util-schema.ts';
import * as Record from 'effect/Record';
import * as S from 'effect/Schema';

export const Key = Document.Key({
  pk: IdSchema.ServerId,
});

export const Items = S.Array(S.Union(
  Server.Versions,
  ServerClan.Versions,
  ServerInfo.Versions,
  ServerAllianceLink.Versions,
));

export const scan = Document.QueryUpgrade(
  encodeOnly(
    S.Struct({
      KeyConditionExpression: Key,
    }),
    Document.QueryInput,
    (input) => ({
      KeyConditionExpression   : 'pk = :pk',
      ExpressionAttributeValues: Record.mapKeys(input.KeyConditionExpression, (k) => `:${k}`),
    }),
  ),
  Items,
);
