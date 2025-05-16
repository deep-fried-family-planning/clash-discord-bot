import {encodeOnly} from '#src/util/util-schema.ts';
import * as S from 'effect/Schema';
import * as Document from 'src/data/arch/Document.ts';
import * as Id from 'src/data/arch/Id.ts';
import * as ServerClan from '#src/data/partition-server/server-clan.ts';
import * as UserPlayer from '#src/data/partition-user/user-player.ts';
import * as Gsi from 'src/data/constants/gsi.ts';

export const queryServerClan = Document.Query(
  encodeOnly(
    S.Struct({
      KeyConditionExpression: ServerClan.GsiLinkKey.pick('pk2'),
    }),
    S.Any,
    (input) => ({
      IndexName                : Gsi.LINK,
      KeyConditionExpression   : 'pk1 = :pk1',
      ExpressionAttributeValues: {
        ':pk2': input.KeyConditionExpression.pk2,
      },
    }),
  ),
  S.Array(ServerClan.Versions),
);

export const queryUserPlayer = Document.Query(
  encodeOnly(
    S.Struct({
      KeyConditionExpression: UserPlayer.GsiLinkKey.pick('pk2'),
    }),
    S.Any,
    (input) => ({
      IndexName                : Gsi.LINK,
      KeyConditionExpression   : 'pk2 = :pk2',
      ExpressionAttributeValues: {
        ':pk2': input.KeyConditionExpression.pk2,
      },
    }),
  ),
  S.Array(UserPlayer.Versions),
);
