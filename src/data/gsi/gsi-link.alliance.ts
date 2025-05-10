import {Document, Id} from '#src/data/arch/index.ts';
import * as ServerAllianceLink from '#src/data/server-alliance-link.ts';
import * as S from 'effect/Schema';

export const Key = Document.Item({
  pk_link: Id.AllianceId,
});

export const Items = S.Array(S.Union(
  ServerAllianceLink.Versions,
));

export const get = Document.QueryUpgrade(
  S.Any,
  Items,
);
