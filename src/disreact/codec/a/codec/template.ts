import * as Doken from '#disreact/codec/a/codec/doken.ts';
import * as S from 'effect/Schema';
import * as Declarations from '#disreact/codec/a/codec/old/declarations.ts';

export const SourceCustomId = S.transform(
  S.TemplateLiteralParser(
    S.String,
    '/', S.String,
  ),
  S.typeSchema(S.Struct({
    source_id: S.String,
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
    '/', Declarations.HydratorTransform,
  ),
  S.typeSchema(S.Struct({
    base    : S.String,
    doken   : Doken.Serial,
    hydrator: Declarations.Hydrator,
  })),
  {
    encode: ({base, doken, hydrator}) =>
      [base, '/', doken, '/', hydrator] as const,
    decode: ([base, , doken, , hydrator]) =>
      ({base, doken, hydrator}) as const,
  },
);
