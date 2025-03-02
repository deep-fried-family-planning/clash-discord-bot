import {_Tag, NONE, ZERO} from '#src/disreact/codec/common/index.ts';
import * as Component from '#src/disreact/codec/dsx/common/component.ts';
import * as Common from '#src/disreact/codec/dsx/element/common.ts';
import type * as Element from '#src/disreact/codec/dsx/element/index.ts';
import {Children} from '#src/disreact/codec/dsx/element/index.ts';
import * as FiberNode from '#src/disreact/codec/dsx/fiber/fiber-node.ts';
import {E, S} from '#src/internal/pure/effect.ts';



export const T = S.Struct({
  ...Common.Fields,
  _tag  : S.tag(_Tag.FUNCTION),
  _kind : S.Literal(_Tag.SYNC, _Tag.EFFECT, _Tag.ASYNC, _Tag.SYNC_OR_EFFECT),
  fiber : FiberNode.T,
  render: S.Unknown,
});

const t = T.pipe(S.mutable);

export type T =
  S.Schema.Type<typeof t>
  & {
    fiber   : FiberNode.T;
    render  : Component.PFC;
    children: Element.T[];
  };

export const is = (type: Element.T): type is T => type._tag === _Tag.FUNCTION;

export const make = (type: Component.PFC, props: any): T => {
  return {
    _kind   : Component.resolveKind(type),
    _tag    : _Tag.FUNCTION,
    _name   : Component.resolveName(type),
    meta    : getMeta(type),
    props,
    fiber   : FiberNode.make(),
    render  : type,
    children: [],
  };
};

export const dsxDEV_make = make;

const getMeta = (type: Component.PFC): T['meta'] => {
  return {
    idx    : ZERO,
    id     : NONE,
    step_id: NONE,
    full_id: NONE,
    root_id: NONE,
  };
};
