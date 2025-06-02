import * as DDB from '#src/data/util/DDB.ts';
import * as Server from '#src/data/partition-server/server.ts';
import * as User from '#src/data/partition-user/user.ts';
import * as S from 'effect/Schema';

const NAME = 'gsi1';

const projected = [
  '_tag',
  '_v',
  '_v7',
  'pk',
  'sk',
  'pk1',
  'sk1',
] as const;

const Items = S.Union(
  Server.Latest.pick(...projected),
  User.Latest.pick(...projected),
);

export const scan = DDB.ScanV2(Items, S.Any, (last) => ({
  IndexName        : NAME,
  Limit            : 25,
  ExclusiveStartKey: last,
}));
