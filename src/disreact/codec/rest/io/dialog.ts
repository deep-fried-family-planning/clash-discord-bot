import {S} from '#src/internal/pure/effect.ts';
import {_Tag} from '../../common';



const TAG = _Tag.DIALOG;

export const I = S.Struct({
  custom_id : S.String,
  components: S.Array(S.Any),
});

export type I = S.Schema.Type<typeof I>;

export const O = S.Struct({
  _tag: S.tag(TAG),
  type: S.Number,
  data: S.Struct({
    custom_id : S.String,
    title     : S.String,
    components: S.Array(S.Any),
  }),
});

export type O = S.Schema.Type<typeof O>;

export const is = (out: any) => out._tag === TAG;

export const encode = ({_tag, ...rest}: O) => rest;
