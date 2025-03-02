import * as Default from '#src/disreact/codec/dsx/event/default.ts';
import {S} from '#src/internal/pure/effect.ts';
import {_Tag, Reserved} from '#src/disreact/codec/common/index.ts';



const TAG = _Tag.SELECT_ROLE;

export const T = S.Struct({
  ...Default.MessageFields,
  _tag    : S.tag(TAG),
  type    : S.tag(Reserved.onselect),
  role_ids: S.Array(S.String),
});

export type T = S.Schema.Type<typeof T>;

export const is = (event: any): event is T => event._tag === TAG;
