import {Document, Id} from '#src/data/arch/index.ts';
import {GsiKey} from '#src/data/constants/index.ts';
import * as UserServerLink from '#src/data/user-server-link.ts';
import * as S from 'effect/Schema';

export const Key = Document.Key({
  [GsiKey.PK_LINK]: Id.ServerId,
});

export const Items = S.Array(S.Union(
  UserServerLink.Versions,
));

export const get = Document.QueryUpgrade(
  S.Any,
  Items,
);
