import * as Document from '#src/data/arch/Document.ts';
import * as Gsi from '#src/data/constants/gsi.ts';
import * as Server from '#src/data/items/server/server.ts';
import * as User from '#src/data/items/user/user.ts';
import {encodeOnly} from '#src/util/util-schema.ts';
import * as Chunk from 'effect/Chunk';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as Option from 'effect/Option';
import * as S from 'effect/Schema';
import * as Stream from 'effect/Stream';

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

export const scanStream = Stream.paginateChunkEffect(
  undefined as any,
  (last) =>
    pipe(
      scan({
        Limit            : 25,
        ExclusiveStartKey: last,
      }),
      E.map((res) => [Chunk.fromIterable(res.Items), Option.fromNullable(res.LastEvaluatedKey)]),
    ),
);

export type Type = typeof Items.Type;
