import {encodeOnly} from '#src/util/util-schema.ts';
import * as S from 'effect/Schema';
import * as Document from './arch/Document.ts';
import * as Id from './arch/Id.ts';
import * as ServerClan from './server-clan.ts';
import * as UserPlayer from './user-player.ts';
import * as Gsi from './constants/gsi.ts';

export const queryServerClan = Document.Query(
  encodeOnly(
    S.Struct({
      KeyConditionExpression: ServerClan.GsiLinkKey.pick('pkl'),
    }),
    S.Any,
    (input) => ({
      IndexName                : Gsi.LINK,
      KeyConditionExpression   : 'pkl = :pkl',
      ExpressionAttributeValues: {
        ':pkl': input.KeyConditionExpression.pkl,
      },
    }),
  ),
  S.Array(ServerClan.Versions),
);

export const queryUserPlayer = Document.Query(
  encodeOnly(
    S.Struct({
      KeyConditionExpression: UserPlayer.GsiLinkKey.pick('pkl'),
    }),
    S.Any,
    (input) => ({
      IndexName                : Gsi.LINK,
      KeyConditionExpression   : 'pkl = :pkl',
      ExpressionAttributeValues: {
        ':pkl': input.KeyConditionExpression.pkl,
      },
    }),
  ),
  S.Array(UserPlayer.Versions),
);
