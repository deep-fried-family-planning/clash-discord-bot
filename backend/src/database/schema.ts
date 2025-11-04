import * as S from 'effect/Schema';

export const User = S.Struct({
  id       : S.String,
  name     : S.String,
  email    : S.String,
  password : S.String,
  createdAt: S.String,
  updatedAt: S.String,
});
