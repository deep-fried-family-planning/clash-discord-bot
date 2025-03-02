/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {_Tag, NONE, ZERO} from '#src/disreact/codec/common/index.ts';
import * as Common from '#src/disreact/codec/dsx/element/common.ts';
import type * as Element from '#src/disreact/codec/dsx/element/index.ts';
import * as Intrinsic from '#src/disreact/codec/dsx/element/intrinsics/index.ts';
import {S} from '#src/internal/pure/effect.ts';



export const T = S.Struct({
  ...Common.Fields,
  _tag: S.tag(_Tag.INTRINSIC),
});

const t = S.mutable(T);

export type T =
  S.Schema.Type<typeof t>
  & {
    children: Element.T[];
  };

export const is = (type: Element.T): type is T => type._tag === _Tag.INTRINSIC;

export const make = (type: string, props: any): T => {
  return {
    _tag : _Tag.INTRINSIC,
    _name: type,
    meta : {
      idx    : ZERO,
      id     : NONE,
      step_id: NONE,
      full_id: NONE,
    },
    props,
    children: [] as any[],
  };
};

export const dsxDEV_make = (type: string, props: any): T => {
  const validator = Intrinsic.dsxDEV_validators_attributes[type as keyof typeof Intrinsic.dsxDEV_validators_attributes];

  if (!validator) {
    throw new Error(`Unknown intrinsic element type: ${type}`);
  }

  return make(type, validator(props));
};
