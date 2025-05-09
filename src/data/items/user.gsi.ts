import {Document} from '#src/data/arch/index.ts';
import {encodeOnly} from '#src/util/util-schema.ts';
import * as S from 'effect/Schema';
import * as Server from './server.ts';

export const Index = 'GSI_ALL_SERVERS';

export const Items = S.Array(S.Union(
  Server.Versions,
));

export const scan = Document.ScanUpgrade(
  encodeOnly(
    S.Struct({
      IndexName: S.optionalWith(S.String, {default: () => Index}),
    }),
    S.Struct({
      IndexName: S.String,
    }),
    (input) => ({
      IndexName: input.IndexName!,
    }),
  ),
  Items,
);
