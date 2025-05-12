import {encodeOnly} from '#src/util/util-schema.ts';
import * as Server from './server.ts';
import * as User from './user.ts';
import * as S from 'effect/Schema';
import * as Document from './arch/Document.ts';
import * as Gsi from './constants/gsi.ts';

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
