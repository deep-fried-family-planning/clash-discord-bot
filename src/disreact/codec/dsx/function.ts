import {FUNCTION} from '#src/disreact/codec/common/_tag.ts';
import {NONE, ZERO} from '#src/disreact/codec/common/index.ts';
import * as Component from '#src/disreact/codec/component/function.ts';
import * as Common from '#src/disreact/codec/dsx/common.ts';
import type * as Element from '#src/disreact/codec/dsx/index.ts';
import * as FiberNode from '#src/disreact/codec/fiber/fiber-node.ts';
import type {Schema} from 'effect/Schema';
import {Struct, tag, Unknown} from 'effect/Schema';



export const T = Struct({
  ...Common.Fields,
  _tag  : tag(FUNCTION),
  fiber : FiberNode.T,
  render: Unknown,
});

export type T = Schema.Type<typeof T> & {
  fiber   : FiberNode.T;
  render  : Component.PFC;
  children: Element.T[];
};

export const is = (type: Element.T): type is T => type._tag === FUNCTION;

export const make = (type: Component.PFC, props: any): T => {
  return {
    _name   : Component.resolveName(type),
    _tag    : FUNCTION,
    meta    : getMeta(type),
    fiber   : FiberNode.make(),
    props,
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
