import * as Lateral from '#src/disreact/core/behaviors/lateral.ts';
import * as Lineage from '#src/disreact/core/behaviors/lineage.ts';
import * as proto from '#src/disreact/core/behaviors/proto.ts';
import type * as FC from '#src/disreact/core/FC.ts';
import type * as Node from '#src/disreact/core/Node.ts';
import {FRAGMENT, FUNCTIONAL, INTRINSIC, LIST_NODE, TEXT_NODE} from '#src/disreact/core/primitives/constants.ts';
import * as fc from '#src/disreact/core/primitives/fc.ts';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';
import type * as Event from '#disreact/core/Event.ts';

const Prototype = proto.type<Node.Base>({
  ...Lineage.Prototype,
  ...Lateral.Prototype,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
});

const TextPrototype = proto.type<Node.Text>({
  ...Prototype,
  _tag: TEXT_NODE,
  toJSON() {
    return Inspectable.format({
      _id : 'Text',
      text: this.component,
    });
  },
});

export const text = (value: string): Node.Text =>
  proto.init(TextPrototype, {
    _tag     : TEXT_NODE,
    component: value,
  });

const ListPrototype = proto.type<Node.List>({
  ...Prototype,
  _tag: LIST_NODE,
  toJSON() {
    return Inspectable.format({
      _id : 'List',
      list: this.children,
    });
  },
});

export const list = (children: Node.Node[]): Node.List =>
  proto.init(ListPrototype, {
    _tag    : LIST_NODE,
    children: children,
  });

export const FragmentTag = Symbol.for('disreact/fragment');

const FragmentPrototype = proto.type<Node.Frag>({
  ...Prototype,
  _tag: FRAGMENT,
  toJSON() {
    return Inspectable.format({
      _id     : 'Fragment',
      children: this.children,
    });
  },
});

export const frag = (children: Node.Node[]): Node.Frag =>
  proto.init(FragmentPrototype, {
    _tag    : FRAGMENT,
    children: children,
  });


const IntrinsicPrototype = proto.type<Node.Rest>({
  ...Prototype,
  _tag: INTRINSIC,
  toJSON() {
    return Inspectable.format({
      _id      : 'Intrinsic',
      component: this.component,
      props    : this.props,
      children : this.children,
    });
  },
});

export const rest = (component: string, props: any): Node.Rest =>
  proto.init(IntrinsicPrototype, {
    _tag     : INTRINSIC,
    component: component,
    props    : props,
  });

const FunctionalPrototype = proto.type<Node.Func>({
  ...Prototype,
  _tag: FUNCTIONAL,
  toJSON() {
    return Inspectable.format({
      _id      : 'Functional',
      component: this.component,
      props    : this.props,
      polymer  : this.polymer,
      children : this.children,
    });
  },
});

export const func = (component: FC.FC, props: any): Node.Func => {
  const type = fc.register(component);

  return proto.init(FunctionalPrototype, {
    _tag     : FUNCTIONAL,
    component: type,
    props    : props,
  });
};

const HandlerPrototype = proto.type<Event.PropsHandler>({
  ...Lineage.EqualPrototype,
});

export const handler = (fn: Event.Handler) =>
  proto.init(HandlerPrototype, fn);

const PropsPrototype = proto.type<Record<string, any>>({
  ...Inspectable.BaseProto,
  toJSON() {
    const {children, ...rest} = this;

    return Inspectable.format({
      _id  : 'Props',
      value: rest,
    });
  },
});

export const props = (input: Record<string, any>): Record<string, any> =>
  proto.init(PropsPrototype, input);
