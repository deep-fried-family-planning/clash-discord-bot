import * as Document from '#src/data/arch/Document.ts';
import * as Gsi from '#src/data/constants/gsi.ts';
import * as Server from '#src/data/server.ts';
import * as User from '#src/data/user.ts';
import {encodeOnly} from '#src/util/util-schema.ts';
import * as S from 'effect/Schema';

export const Items = S.Array(
  S.Union(
    Server.Latest,
    User.Latest,
  ),
);

export const scan = Document.Query(
  encodeOnly(
    S.Struct({}),
    S.Any,
    () => ({
      IndexName: Gsi.POLL,
    }),
  ),
  Items,
);
