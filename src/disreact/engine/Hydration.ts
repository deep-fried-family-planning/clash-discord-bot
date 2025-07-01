import * as S from 'effect/Schema';

export const Hydrant = S.Struct({
  _tag : S.tag('Hydrant'),
  id   : S.String,
  props: S.Record({key: S.String, value: S.Any}),
  state: S.Record({key: S.String, value: S.Any}),
});
