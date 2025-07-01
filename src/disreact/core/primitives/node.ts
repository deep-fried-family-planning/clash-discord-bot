import type * as Event from '#disreact/core/Event.ts';
import * as Lateral from '#src/disreact/core/behaviors/lateral.ts';
import * as Lineage from '#src/disreact/core/behaviors/lineage.ts';
import * as proto from '#src/disreact/core/behaviors/proto.ts';
import type * as FC from '#src/disreact/core/FC.ts';
import type * as Node from '#src/disreact/core/Node.ts';
import {FRAGMENT, FUNCTIONAL, INTRINSIC, LIST_NODE, TEXT_NODE} from '#src/disreact/core/primitives/constants.ts';
import * as fc from '#src/disreact/core/primitives/fc.ts';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';

export const HandlerId = Symbol.for('disreact/handler');

const HandlerPrototype = proto.type<Event.PropsHandler>({
  [HandlerId]: HandlerId,
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id: 'PropsHandler',
    });
  },
  [Hash.symbol]() {
    return 1;
  },
  [Equal.symbol](that: Event.PropsHandler) {
    return that[HandlerId] === HandlerId;
  },
});

export const handler = (fn: Event.Handler) => proto.init(HandlerPrototype, fn);

const PropsPrototype = proto.type<Record<string, any>>({
  ...Inspectable.BaseProto,
  toJSON() {
    const {children, ...rest} = this;

    return Inspectable.format({
      _id  : 'Props',
      value: rest,
    });
  },
  [Hash.symbol]() {
    return proto.structHash(this);
  },
  [Equal.symbol](that: Record<string, any>) {
    return proto.structEquals(this, that);
  },
});

export const makeProps = (input: any): Record<string, any> =>
  proto.init(PropsPrototype, input);

export const propsIntrinsic = (input: any) => {
  const self = makeProps(input);
  if (self.onclick) {
    self.onclick = handler(self.onclick);
  }
  if (self.onselect) {
    self.onselect = handler(self.onselect);
  }
  if (self.onsubmit) {
    self.onsubmit = handler(self.onsubmit);
  }
  return self;
};

const Prototype = proto.type<Node.Node>({
  _tag     : undefined as any,
  component: undefined as any,
  text     : undefined as any,
  props    : undefined as any,
  children : undefined as any,
  polymer  : undefined as any,
  source   : undefined as any,
  ...Lineage.Prototype,
  ...Lateral.Prototype,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON() {
    switch (this._tag) {
      case TEXT_NODE: {
        return Inspectable.format({
          _id : 'Text',
          text: this.text,
        });
      }
      case LIST_NODE: {
        return Inspectable.format({
          _id     : 'List',
          children: this.children,
        });
      }
      case FRAGMENT: {
        return Inspectable.format({
          _id     : 'Fragment',
          children: this.children,
        });
      }
      case INTRINSIC: {
        return Inspectable.format({
          _id      : 'Intrinsic',
          component: this.component,
          props    : this.props,
          children : this.children,
        });
      }
      case FUNCTIONAL: {
        return Inspectable.format({
          _id      : 'Functional',
          component: this.component,
          props    : this.props,
          polymer  : this.polymer,
          children : this.children,
        });
      }
    }
  },
});

export const text = (value: string): Node.Text =>
  proto.init(Prototype, {
    _tag: TEXT_NODE,
    text: value,
  }) as Node.Text;

export const list = (children: Node.Node[]): Node.List =>
  proto.init(Prototype, {
    _tag    : LIST_NODE,
    children: children,
  }) as Node.List;

export const FragmentTag = Symbol.for('disreact/fragment');

export const frag = (children: Node.Node[]): Node.Frag =>
  proto.init(Prototype, {
    _tag    : FRAGMENT,
    children: children,
  }) as Node.Frag;

export const rest = (type: string, props: any): Node.Rest => {
  const self = proto.init(Prototype, {
    _tag     : INTRINSIC,
    component: type,
    props    : propsIntrinsic(props),
  });
  return self as Node.Rest;
};

export const func = (type: FC.FC, props: any): Node.Func => {
  const component = fc.register(type);

  return proto.init(Prototype, {
    _tag     : FUNCTIONAL,
    component: component,
    props    : makeProps(props),
  }) as Node.Func;
};
