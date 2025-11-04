import * as DDB from '#src/data/util/DDB.ts';
import * as Clan from '#src/data/partition-server/clan.ts';
import * as Player from '#src/data/partition-user/player.ts';
import * as Link from '#src/data/partition-user/link.ts';
import * as S from 'effect/Schema';

const IndexName = 'gsi2';

export const queryClan = DDB.QueryV2(
  Clan.Versions,
  Clan.Latest.fields.pk2,
  (key) => ({
    IndexName                : IndexName,
    KeyConditionExpression   : 'pk2 = :pk2',
    ExpressionAttributeValues: {
      ':pk2': key,
    },
  }),
);

export const queryPlayer = DDB.QueryV2(
  Player.Versions,
  Player.Latest.fields.pk2,
  (key) => ({
    IndexName                : IndexName,
    KeyConditionExpression   : 'pk2 = :pk2',
    ExpressionAttributeValues: {
      ':pk2': key,
    },
  }),
);

export const queryLinks = DDB.QueryV2(
  Link.Versions,
  S.Struct({
    server: Link.Item.fields.pk2,
    last  : S.Any,
  }),
  (key) => ({
    IndexName                : IndexName,
    Limit                    : 25,
    KeyConditionExpression   : 'pk2 = :pk2',
    ExpressionAttributeValues: {
      ':pk2': key,
    },
  }),
);
