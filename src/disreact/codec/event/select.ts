import {_Tag, Reserved} from '#src/disreact/codec/common/index.ts';
import * as Default from '#src/disreact/codec/event/default.ts';
import {S} from '#src/internal/pure/effect.ts';


export const TAG = _Tag.SELECT;

export const T = S.Struct({
  ...Default.MessageFields,
  _tag   : S.tag(TAG),
  type   : S.tag(Reserved.onselect),
  values : S.Array(S.String),
  options: S.Array(S.Struct({
    value      : S.String,
    label      : S.optional(S.String),
    description: S.optional(S.String),
    default    : S.optional(S.Boolean),
    emoji      : S.optional(S.Struct({
      id      : S.optional(S.String),
      name    : S.optional(S.String),
      animated: S.optional(S.Boolean),
    })),
  })),
});

export type T = S.Schema.Type<typeof T>;

export const is = (event: any): event is T => event._tag === TAG;
