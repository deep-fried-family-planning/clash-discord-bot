import * as DDB from '#src/data/util/DDB.ts';
import * as Id from '#src/data/util/Id.ts';
import * as Player from '#src/data/partition-user/player.ts';
import * as User from '#src/data/partition-user/user.ts';
import * as Link from '#src/data/partition-user/link.ts';
import * as S from 'effect/Schema';

const Key = Id.UserId;

const All = S.Union(
  Player.Versions,
  User.Versions,
  Link.Versions,
);

const ItemsUp = S.Union(
  Player.Versions,
  User.Versions,
);

const ItemsDown = S.Union(
  User.Versions,
  Link.Versions,
);

export const scan = DDB.QueryV2(
  All,
  S.Struct({
    user: Key,
    last: S.Any,
  }),
  (key) => ({
    KeyConditionExpression   : 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': key,
    },
  }),
);

export const scanUp = DDB.QueryV2(ItemsUp, Key, (key) => ({
  KeyConditionExpression   : 'pk = :pk AND sk >= :sk',
  ExpressionAttributeValues: {
    ':pk': key,
    ':sk': '@',
  },
  ScanIndexForward: false,
}));

export const scanDown = DDB.QueryV2(ItemsDown, Key, (key) => ({
  KeyConditionExpression   : 'pk = :pk AND sk <= :sk',
  ExpressionAttributeValues: {
    ':pk': key,
    ':sk': '@',
  },
}));
