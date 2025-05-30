import {Doken} from '#src/disreact/codec/rest/doken.ts';
import {Declare} from '#src/disreact/mode/schema/declare.ts';
import * as S from 'effect/Schema';

export * as Template from '#src/disreact/codec/rest/template.ts';
export type Template = never;

export const SourceCustomId = S.transform(
  S.TemplateLiteralParser(
    Declare.SourceId,
    '/', S.String,
  ),
  S.typeSchema(S.Struct({
    source_id: Declare.SourceId,
    custom_id: S.String,
  })),
  {
    encode: ({source_id, custom_id}) =>
      [source_id, '/', custom_id] as const,
    decode: ([source_id, , custom_id]) =>
      ({source_id, custom_id}) as const,
  },
);

export const DokenRehydrantUrl = S.transform(
  S.TemplateLiteralParser(
    S.String,
    '/', Doken.Serial,
    '/', Declare.Hydrator,
  ),
  S.typeSchema(S.Struct({
    base    : S.String,
    doken   : Doken.Serial,
    hydrator: Declare.Hydrator,
  })),
  {
    encode: ({base, doken, hydrator}) =>
      [base, '/', doken, '/', hydrator] as const,
    decode: ([base, , doken, , hydrator]) =>
      ({base, doken, hydrator}) as const,
  },
);
