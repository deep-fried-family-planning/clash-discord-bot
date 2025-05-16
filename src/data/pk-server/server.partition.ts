import * as Document from '#src/data/arch/Document.ts';
import * as Id from '#src/data/arch/Id.ts';
import * as ServerClan from '#src/data/pk-server/server-.clan.ts';
import * as Server from '#src/data/pk-server/server-@.ts';
import * as ServerInfo from '#src/data/pk-server/server-info.ts';
import * as S from 'effect/Schema';

const Key = Id.ServerId;

const Items = S.Union(
  ServerClan.Versions,
  Server.Versions,
  ServerInfo.Versions,
);

const ItemsUp = S.Union(
  ServerClan.Versions,
  Server.Versions,
);

const ItemsDown = S.Union(
  Server.Versions,
  ServerInfo.Versions,
);

export const scan = Document.QueryV2(Items, Key, (key) => ({
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
