import * as Document from '#src/data/arch/Document.ts';
import * as Gsi from '#src/data/constants/gsi.ts';
import * as ServerClan from '#src/data/server-clan.ts';
import * as UserPlayer from '#src/data/user-player.ts';
import * as UserServerLink from '#src/data/user-server-link.ts';
import {encodeOnly} from '#src/util/util-schema.ts';
import * as S from 'effect/Schema';

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

export const scanServerLinks = Document.Query(
  encodeOnly(
    S.Struct({
      KeyConditionExpression: UserServerLink.LinkKey.pick('pkl'),
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
  S.Array(UserServerLink.Versions),
);
