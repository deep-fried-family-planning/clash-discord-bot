import {_Tag, NONE, ZERO} from '#src/disreact/codec/common/index.ts';
import * as Common from '#src/disreact/codec/dsx/common.ts';
import type * as Element from '#src/disreact/codec/dsx/index.ts';
import {mutable, type Schema, String, Struct, tag} from 'effect/Schema';



export const T = Struct({
  ...Common.Fields,
  _tag : tag(_Tag.TEXT),
  value: String,
});

const t = mutable(T);

export type T =
  Schema.Type<typeof t>
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
