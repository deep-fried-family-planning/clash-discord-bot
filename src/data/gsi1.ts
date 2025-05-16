import * as Document from '#src/data/arch/Document.ts';
import * as Server from '#src/data/pk-server/server-@.ts';
import * as User from '#src/data/pk-user/user-@.ts';
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

export const scan = Document.ScanV2(Items, S.Any, (last) => ({
  IndexName        : NAME,
  ExclusiveStartKey: last,
}));
