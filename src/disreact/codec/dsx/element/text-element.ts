import {_Tag, NONE, ZERO} from '#src/disreact/codec/common/index.ts';
import * as Common from '#src/disreact/codec/dsx/element/common.ts';
import type * as Element from '#src/disreact/codec/dsx/element/index.ts';
import {S} from '#src/internal/pure/effect.ts';



export const T = S.Struct({
  ...Common.Fields,
  _tag : S.tag(_Tag.TEXT),
  value: S.String,
});

const t = S.mutable(T);

export type T =
  S.Schema.Type<typeof t>
  & {
    children: Element.T[];
  };

export const is = (type: Element.T): type is T => type._tag === _Tag.TEXT;

export const make = (type: string): T => {
  return {
    _tag : _Tag.TEXT,
    _name: 'string',
    meta : {
      idx    : ZERO,
      id     : NONE,
      step_id: NONE,
      full_id: NONE,
    },
    value   : type,
    props   : {},
    children: [],
  };
};

export const dsxDEV_make = make;
