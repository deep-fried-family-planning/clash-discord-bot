import * as Lateral from '#src/disreact/core/behaviors/lateral.ts';
import * as Lineage from '#src/disreact/core/behaviors/lineage.ts';
import * as proto from '#src/disreact/core/behaviors/proto.ts';
import type * as Node from '#src/disreact/core/Node.ts';
import {FRAGMENT, FUNCTIONAL, INTRINSIC, LIST_NODE, TEXT_NODE} from '#src/disreact/core/primitives/constants.ts';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';
import type * as FC from '#src/disreact/core/FC.ts';

const Prototype = proto.type<Node.Base>({
  ...Lineage.Prototype,
  ...Lateral.Prototype,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
});

const TextPrototype = proto.type<Node.Text>({
  ...Prototype,
  _tag: TEXT_NODE,
});

const ListPrototype = proto.type<Node.List>({
  ...Prototype,
  _tag: LIST_NODE,
});

export const FragmentTag = Symbol.for('disreact/fragment');

const FragmentPrototype = proto.type<Node.Frag>({
  ...Prototype,
  _tag: FRAGMENT,
});

const IntrinsicPrototype = proto.type<Node.Rest>({
  ...Prototype,
  _tag: INTRINSIC,
});

const FunctionalPrototype = proto.type<Node.Func>({
  ...Prototype,
  _tag: FUNCTIONAL,
});

export const text = (value: string): Node.Text =>
  proto.init(TextPrototype, {
    _tag     : TEXT_NODE,
    component: value,
  });

export const list = (children: Node.Node[]): Node.List =>
  proto.init(ListPrototype, {
    _tag    : LIST_NODE,
    children: children,
  });

export const frag = (children: Node.Node[]): Node.Frag =>
  proto.init(FragmentPrototype, {
    _tag    : FRAGMENT,
    children: children,
  });

export const rest = (component: string, props: any): Node.Rest =>
  proto.init(IntrinsicPrototype, {
    _tag     : INTRINSIC,
    component: component,
    props    : props,
  });

export const func = (component: FC.FC, props: any): Node.Func =>
  proto.init(FunctionalPrototype, {
    _tag     : FUNCTIONAL,
    component: component,
    props    : props,
  });
