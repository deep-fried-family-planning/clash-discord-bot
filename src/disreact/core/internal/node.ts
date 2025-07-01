import type * as Event from '#disreact/core/Event.ts';
import type * as FC from '#disreact/core/FC.ts';
import {FRAGMENT, FUNCTIONAL, INTRINSIC, LIST_NODE, TEXT_NODE} from '#disreact/core/immutable/constants.ts';
import * as fc from '#disreact/core/internal/fc.ts';
import type * as Node from '#disreact/core/Node.ts';
import * as Lateral from '#src/disreact/core/behaviors/lateral.ts';
import * as Lineage from '#src/disreact/core/behaviors/lineage.ts';
import * as proto from '#src/disreact/core/behaviors/proto.ts';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';

const Prototype = proto.type<Node.Node>({
  _tag     : undefined as any,
  component: undefined as any,
  text     : undefined as any,
  props    : undefined as any,
  children : undefined as any,
  polymer  : undefined as any,
  t        : '',
  s        : '',
  i        : 0,
  p        : 0,
  d        : 0,
  n        : '',
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
    n   : 't',
  }) as Node.Text;

export const list = (children: Node.Node[]): Node.List =>
  proto.init(Prototype, {
    _tag    : LIST_NODE,
    children: children,
    n       : 'l',
  }) as Node.List;

export const FragmentTag = Symbol.for('disreact/fragment');

export const frag = (children: Node.Node[]): Node.Frag =>
  proto.init(Prototype, {
    _tag    : FRAGMENT,
    children: children,
    n       : 'f',
  }) as Node.Frag;

export const rest = (type: string, props: any): Node.Rest => {
  const self = proto.init(Prototype, {
    _tag     : INTRINSIC,
    component: type,
    props    : propsIntrinsic(props),
    n        : type,
  });
  return self as Node.Rest;
};

export const func = (type: FC.FC, props: any): Node.Func => {
  const component = fc.register(type);

  return proto.init(Prototype, {
    _tag     : FUNCTIONAL,
    component: component,
    props    : makeProps(props),
    n        : component._id!,
  }) as Node.Func;
};

export const trie = (self: Node.Node) => `${self.d}:${self.p}:${self.i}:${self.n}`;

export const step = (self: Node.Node) => `${self.d}:${self.p}:${self.i}:${self.n}`;

export const connectSingleRendered = (self: Node.Node, child: any): Node.Node[] => {
  if (!child._tag) {
    if (typeof child !== 'object') {
      child = text(child);
    }
  }
  Lineage.set(child, self);
  (child as Node.Node).d = self.d + 1;
  (child as Node.Node).p = self.p;
  (child as Node.Node).t = `${self.t}:${trie(child)}`;
  (child as Node.Node).s = `${self.s}:${step(child)}`;
  return [child];
};

export const connectAllRendered = (self: Node.Node, children: any[]): Node.Node[] => {
  const depth = self.d + 1;
  const name = step(self);

  for (let i = 0; i < children.length; i++) {
    if (!children[i]._tag) {
      if (typeof children[i] !== 'object') {
        children[i] = text(children[i]);
      }
      else {
        children[i] = list(children[i]);
      }
    }
    const child = children[i] as Node.Node;
    Lineage.set(child, self);
    if (children[i - 1]) {
      Lateral.setTail(child, children[i - 1]);
      Lateral.setHead(children[i - 1], child);
    }
    child.d = depth;
    child.i = i;
    child.p = self.p;
    child.t = `${self.t}:${trie(child)}`;
    child.s = `${name}:${step(child)}`;
  }
  return children;
};

export const connectRendered = (self: Node.Node, children?: any[]): Node.Node[] => {
  if (!children) {
    return [];
  }
  if (children.length === 0) {
    return [];
  }
  if (children.length === 1) {
    return connectSingleRendered(self, children[0]);
  }
  return connectAllRendered(self, children);
};

export const connect = (self: Node.Node) => {
  if (!self.children) {
    return self;
  }
  self.children = connectAllRendered(self, self.children);
  return self;
};

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
    self.onclick = fc.handler(self.onclick);
  }
  if (self.onselect) {
    self.onselect = fc.handler(self.onselect);
  }
  if (self.onsubmit) {
    self.onsubmit = fc.handler(self.onsubmit);
  }
  return self;
};
