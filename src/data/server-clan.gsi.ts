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
    S.Struct({
      IndexName: S.optionalWith(S.String, {default: () => Index}),
    }),
    S.Struct({
      IndexName: S.String,
    }),
    (input) => ({
      IndexName: input.IndexName!,
    }),
  ),
  Items,
);

export const query = Document.Query(
  encodeOnly(
    S.Struct({
      IndexName             : S.optionalWith(S.String, {default: () => Index}),
      KeyConditionExpression: S.Struct({
        gsi_clan_tag: Id.ClanTag,
      }),
    }),
    S.Struct({
      IndexName                : S.String,
      KeyConditionExpression   : S.String,
      ExpressionAttributeValues: S.Any,
    }),
    (input) => ({
      IndexName                : input.IndexName!,
      KeyConditionExpression   : 'gsi_clan_tag = :gsi_clan_tag',
      ExpressionAttributeValues: {
        ':gsi_clan_tag': input.KeyConditionExpression.gsi_clan_tag,
      },
    }),
  ),
  Items,
);
