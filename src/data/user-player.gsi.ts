import {Document, Id} from '#src/data/arch/index.ts';
import * as UserPlayer from '#src/data/user-player.ts';
import {encodeOnly} from '#src/util/util-schema.ts';
import * as S from 'effect/Schema';

export const Index = 'GSI_ALL_PLAYERS';

export const Items = S.Array(S.Union(
  UserPlayer.Versions,
));

export const scan = Document.ScanUpgrade(
  encodeOnly(
    S.Struct({}),
    S.Struct({
      IndexName: S.String,
    }),
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
        gsi_player_tag: Id.PlayerTag,
      }),
    }),
    S.Struct({
      IndexName                : S.String,
      KeyConditionExpression   : S.String,
      ExpressionAttributeValues: S.Any,
    }),
    (input) => ({
      IndexName                : Index,
      KeyConditionExpression   : 'gsi_player_tag = :gsi_player_tag',
      ExpressionAttributeValues: {
        ':gsi_player_tag': input.KeyConditionExpression.gsi_player_tag,
      },
    }),
  ),
  Items,
);
