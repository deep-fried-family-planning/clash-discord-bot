import * as Document from '#src/data/arch/Document.ts';
import * as ServerClan from '#src/data/pk-server/server-clan.ts';
import * as UserPlayer from '#src/data/pk-user/user-player.ts';
import * as UserLink from '#src/data/pk-user/user-link.ts';
import * as S from 'effect/Schema';

const IndexName = 'gsi2';

export const queryClan = Document.QueryV2(
  ServerClan.Versions,
  ServerClan.Latest.fields.pk2,
  (key) => ({
    IndexName                : IndexName,
    KeyConditionExpression   : 'pk2 = :pk2',
    ExpressionAttributeValues: {
      ':pk2': key,
    },
  }),
);

export const queryPlayer = Document.QueryV2(
  UserPlayer.Versions,
  UserPlayer.Latest.fields.pk2,
  (key) => ({
    IndexName                : IndexName,
    KeyConditionExpression   : 'pk2 = :pk2',
    ExpressionAttributeValues: {
      ':pk2': key,
    },
  }),
);

export const queryLinks = Document.QueryV2(
  UserLink.Versions,
  S.Struct({
    server: UserLink.Item.fields.pk2,
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
