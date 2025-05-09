import {Document, IdSchema} from '#src/data/arch/index.ts';
import * as UserPlayer from '#src/data/items/user-player.ts';
import {encodeOnly} from '#src/util/util-schema.ts';
import * as S from 'effect/Schema';

export const Index = 'GSI_ALL_PLAYERS';

export const Items = S.Array(S.Union(
  UserPlayer.Versions,
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
        gsi_player_tag: IdSchema.PlayerTag,
      }),
    }),
    S.Struct({
      IndexName                : S.String,
      KeyConditionExpression   : S.String,
      ExpressionAttributeValues: S.Any,
    }),
    (input) => ({
      IndexName                : input.IndexName!,
      KeyConditionExpression   : 'gsi_player_tag = :gsi_player_tag',
      ExpressionAttributeValues: {
        ':gsi_player_tag': input.KeyConditionExpression.gsi_player_tag,
      },
    }),
  ),
  Items,
);
