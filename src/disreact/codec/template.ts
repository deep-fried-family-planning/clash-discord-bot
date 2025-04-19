import {S} from '#src/disreact/utils/re-exports.ts';
import {Declare} from '../model/exp/declare.ts';
import {Doken} from './doken.ts';

export * as Template from './template.ts';
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
