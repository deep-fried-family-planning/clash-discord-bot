import * as Document from '#src/data/arch/Document.ts';
import * as Id from '#src/data/arch/Id.ts';
import * as UserPlayer from '#src/data/pk-user/user-.player.ts';
import * as User from '#src/data/pk-user/user-@.ts';
import * as UserLink from '#src/data/pk-user/user-link.ts';
import * as S from 'effect/Schema';

const Key = Id.UserId;

const All = S.Union(
  UserPlayer.Versions,
  User.Versions,
  UserLink.Versions,
);

const ItemsUp = S.Union(
  UserPlayer.Versions,
  User.Versions,
);

const ItemsDown = S.Union(
  User.Versions,
  UserLink.Versions,
);

export const scan = Document.QueryV2(All, Key, (key) => ({
  KeyConditionExpression   : 'pk = :pk',
  ExpressionAttributeValues: {
    ':pk': key,
  },
}));

export const scanUp = Document.QueryV2(ItemsUp, Key, (key) => ({
  KeyConditionExpression   : 'pk = :pk AND sk >= :sk',
  ExpressionAttributeValues: {
    ':pk': key,
    ':sk': '@',
  },
  ScanIndexForward: false,
}));

export const scanDown = Document.QueryV2(ItemsDown, Key, (key) => ({
  KeyConditionExpression   : 'pk = :pk AND sk <= :sk',
  ExpressionAttributeValues: {
    ':pk': key,
    ':sk': '@',
  },
}));
