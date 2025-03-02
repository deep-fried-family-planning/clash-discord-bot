import * as Default from '#src/disreact/codec/dsx/event/default.ts';
import {S} from '#src/internal/pure/effect.ts';
import {_Tag, Reserved} from '#src/disreact/codec/common/index.ts';



const TAG = _Tag.SUBMIT;

export const T = S.Struct({
  ...Default.DialogFields,
  _tag  : S.tag(TAG),
  type  : S.tag(Reserved.onsubmit),
  values: S.Array(S.String),
});

export type T = S.Schema.Type<typeof T>;

export const is = (event: any): event is T => event._tag === TAG;
