import {Document, Id} from '#src/data/arch/index.ts';
import * as ServerClan from '#src/data/server-clan.ts';
import {encodeOnly} from '#src/util/util-schema.ts';
import * as S from 'effect/Schema';

export const Index = 'GSI_ALL_CLANS';

export const Items = S.Array(S.Union(
  ServerClan.Versions,
));

export const scan = Document.ScanUpgrade(
  encodeOnly(
    S.Struct({}),
    Document.ScanInput,
    (input) => ({
      IndexName: Index,
    }),
  ),
  Items,
);

export const query = Document.Query(
  encodeOnly(
    S.Struct({
      KeyConditionExpression: S.Struct({
        gsi_clan_tag: Id.ClanTag,
      }),
    }),
    Document.QueryInput,
    (input) => ({
      IndexName                : Index,
      KeyConditionExpression   : 'gsi_clan_tag = :gsi_clan_tag',
      ExpressionAttributeValues: {
        ':gsi_clan_tag': input.KeyConditionExpression.gsi_clan_tag,
      },
    }),
  ),
  Items,
);
