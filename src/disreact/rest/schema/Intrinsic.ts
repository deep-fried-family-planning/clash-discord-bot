import * as S from 'effect/Schema';

export const AtMentionTag = 'at';

export const AtMentionAttributes = S.Union(
  S.Struct({user: S.String}),
  S.Struct({user: S.String}),
);
