import {_Tag, Reserved} from '#src/disreact/codec/common/index.ts';
import * as Default from '#src/disreact/codec/event/default.ts';
import {S} from '#src/internal/pure/effect.ts';



const TAG = _Tag.BUTTON;

export const T = S.Struct({
  ...Default.MessageFields,
  _tag: S.tag(TAG),
  type: S.tag(Reserved.onclick),
});

export type T = S.Schema.Type<typeof T>;

export const is = (event: any): event is T => event._tag === TAG;
