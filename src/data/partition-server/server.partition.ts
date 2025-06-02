import * as DDB from '#src/data/util/DDB.ts';
import * as Id from '#src/data/util/Id.ts';
import * as Clan from '#src/data/partition-server/clan.ts';
import * as Server from '#src/data/partition-server/server.ts';
import * as Info from '#src/data/partition-server/info.ts';
import * as S from 'effect/Schema';

const Key = Id.ServerId;

const Items = S.Union(
  Clan.Versions,
  Server.Versions,
  Info.Versions,
);

const ItemsUp = S.Union(
  Clan.Versions,
  Server.Versions,
);

const ItemsDown = S.Union(
  Server.Versions,
  Info.Versions,
);

export const scan = DDB.QueryV2(
  Items,
  Key,
  (key) => ({
    KeyConditionExpression   : 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': key,
    },
  }),
);

export const scanUp = DDB.QueryV2(
  ItemsUp,
  S.Struct({
    server: Key,
    last  : S.Any,
  }),
  (input) => ({
    Limit                    : 25,
    ExclusiveStartKey        : input.last,
    ScanIndexForward         : false,
    KeyConditionExpression   : 'pk = :pk AND sk >= :sk',
    ExpressionAttributeValues: {
      ':pk': input.server,
      ':sk': '@',
    },
  }),
);

export const scanDown = DDB.QueryV2(
  ItemsDown,
  Key,
  (key) => ({
    KeyConditionExpression   : 'pk = :pk AND sk <= :sk',
    ExpressionAttributeValues: {
      ':pk': key,
      ':sk': '@',
    },
  }),
);
