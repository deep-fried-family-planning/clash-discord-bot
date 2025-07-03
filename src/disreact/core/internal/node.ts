import type * as FC from '#disreact/core/FC.ts';
import {FRAGMENT, FUNCTIONAL, INTRINSIC, LIST_NODE, TEXT_NODE} from '#disreact/core/immutable/constants.ts';
import * as fc from '#disreact/core/internal/fc.ts';
import type * as Node from '#disreact/core/Node.ts';
import type * as Jsx from '#disreact/runtime/Jsx.ts';
import * as Lateral from '#src/disreact/core/behaviors/lateral.ts';
import * as Lineage from '#src/disreact/core/behaviors/lineage.ts';
import * as proto from '#src/disreact/core/behaviors/proto.ts';
import * as Array from 'effect/Array';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Inspectable from 'effect/Inspectable';
import * as MutableRef from 'effect/MutableRef';
import * as Pipeable from 'effect/Pipeable';

export const TypeId = Symbol.for('disreact/node');

export const FragmentSymbol = Symbol.for('disreact/fragment');

const Prototype = proto.type<Node.Node>({
  [TypeId] : TypeId,
  _tag     : undefined as any,
  component: undefined as any,
  text     : undefined as any,
  props    : undefined as any,
  children : undefined as any,
  rendered : undefined as any,
  polymer  : undefined as any,
  trie     : undefined as any,
  step     : undefined as any,
  idx      : 0,
  pdx      : 0,
  depth    : 0,
  height   : 0,
  jsxIndex : 0,
  jsxHeight: 0,
  jsxDepth : 0,
  name     : undefined as any,
  parent   : undefined,
  ...Lineage.Prototype,
  ...Lateral.Prototype,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON,
  toString,
});

export const isValue = (u: unknown): u is Jsx.Text => !u || typeof u !== 'object';

export const isNode = (u: unknown): u is Node.Node => !!u && typeof u === 'object' && TypeId in u;

export const isNodeNonPrimitive = (u: {}): u is Node.Node => TypeId in u;

export const text = (text: any): Node.Text =>
  proto.init(Prototype, {
    _tag: TEXT_NODE,
    text: text,
    name: '{}',
  }) as Node.Text;

export const list = (children: Node.Node[]): Node.List =>
  proto.init(Prototype, {
    _tag    : LIST_NODE,
    children: children,
    name    : '[]',
  }) as Node.List;

export const frag = (children: Node.Node[]): Node.Frag =>
  proto.init(Prototype, {
    _tag    : FRAGMENT,
    children: children,
    name    : '</>',
  }) as Node.Frag;

export const rest = (type: string, props: any): Node.Rest => {
  const self = proto.init(Prototype, {
    _tag     : INTRINSIC,
    component: type,
    props    : propsIntrinsic(props),
    name     : type,
  });
  return self as Node.Rest;
};

export const func = (type: FC.FC, props: any): Node.Func => {
  const component = fc.register(type);

  return proto.init(Prototype, {
    _tag     : FUNCTIONAL,
    component: component,
    props    : makeProps(props),
    name     : component._id!,
  }) as Node.Func;
};

export const trie = (self: Node.Node) => `${self.depth}:${self.pdx}:${self.idx}:${self.name}`;

export const step = (self: Node.Node) => `${self.depth}:${self.pdx}:${self.idx}:${self.name}`;

export const clone = <A extends Node.Node>(self: A | unknown): A => {
  if (!isNode(self)) {
    throw new Error(`[Node.clone]: unknown type ${self}`);
  }
  switch (self._tag) {
    case TEXT_NODE: {
      return text(self.text) as A;
    }
    case LIST_NODE: {
      return list(self.children?.map(clone) ?? []) as A; // todo
    }
    case FRAGMENT: {
      return frag(self.children?.map(clone) ?? []) as A;
    }
    case INTRINSIC: {
      return rest(self.component, self.props) as A;
    }
    case FUNCTIONAL: {
      return func(self.component, self.props) as A;
    }
  }
};

export const liftChild = (child: unknown | unknown[]): Node.Node => {
  if (isValue(child)) {
    return text(child);
  }
  if (isNodeNonPrimitive(child)) {
    return clone(child);
  }
  if (Array.isArray(child)) {
    return list(child.map(liftChild));
  }
  throw new Error();
};

export const liftChildrenJsx = (children: unknown, parent: Node.Node): Node.Node[] => {
  const self = liftChild(children);
  parent.jsxHeight = self.jsxHeight + 1;
  self.parent = parent;
  return [self];
};

export const liftChildrenJsxs = (children: unknown[], parent: Node.Node): Node.Node[] => {
  const acc = Array.fromIterable(children) as Node.Node[];
  let h = 0;
  for (let i = 0; i < children.length; i++) {
    const self = liftChild(children[i]);
    if (self.jsxHeight > h) {
      h = self.jsxHeight;
    }
    self.parent = parent;
  }
  parent.jsxHeight = h + 1;
  return acc;
};

export const liftChildrenRendered = (children: unknown | unknown[], parent: Node.Node): Node.Node[] => {
  if (!children || typeof children !== 'object') {
    return [text(children)];
  }
  if (isNodeNonPrimitive(children)) {
    return [clone(children)];
  }
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      const self = liftChild(children[i]);
      self.parent = parent;
    }
  }
  throw new Error();
};

export const connectSingleRendered = (self: Node.Node, child: any): Node.Node[] => {
  if (!child || typeof child !== 'object') {
    child = text(child);
  }
  if (!child._tag) {
    child = list(child);
  }
  Lineage.set(child, self);
  (child as Node.Node).depth = self.depth + 1;
  (child as Node.Node).pdx = self.pdx;
  (child as Node.Node).trie = `${self.trie}:${trie(child)}`;
  (child as Node.Node).step = `${self.step}:${step(child)}`;
  return [child];
};

export const connectAllRendered = (self: Node.Node, children: any[]): Node.Node[] => {
  const depth = self.depth + 1;
  const name = step(self);

  for (let i = 0; i < children.length; i++) {
    if (typeof children[i] !== 'object') {
      children[i] = text(children[i]);
    }
    if (!children[i]._tag) {
      children[i] = list(children[i]);
    }
    const child = children[i] as Node.Node;
    Lineage.set(child, self);
    if (children[i - 1]) {
      Lateral.setTail(child, children[i - 1]);
      Lateral.setHead(children[i - 1], child);
    }
    child.depth = depth;
    child.idx = i;
    child.pdx = self.pdx;
    child.trie = `${self.trie}:${trie(child)}`;
    child.step = `${name}:${step(child)}`;
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

export const connect = <A extends Node.Node>(self: A): A => {
  if (!self.children) {
    return self;
  }
  self.children = connectAllRendered(self, self.children);
  return self;
};

export const accept = <A extends Node.Node>(self: A): A => {

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

function toJSON(this: Node.Node) {
  switch (this._tag) {
    case TEXT_NODE: {
      return Inspectable.format({
        _id : 'Node',
        _tag: 'Text',
        text: this.text,
      });
    }
    case LIST_NODE: {
      return Inspectable.format({
        _id     : 'Node',
        _tag    : 'List',
        children: this.children,
      });
    }
    case FRAGMENT: {
      return Inspectable.format({
        _id     : 'Node',
        _tag    : 'Fragment',
        children: this.children,
      });
    }
    case INTRINSIC: {
      return Inspectable.format({
        _id      : 'Node',
        _tag     : 'REST',
        component: this.component,
        props    : this.props,
        children : this.children,
      });
    }
    case FUNCTIONAL: {
      return Inspectable.format({
        _id      : 'Node',
        _tag     : 'Function',
        component: this.component,
        props    : this.props,
        polymer  : this.polymer,
        children : this.children,
      });
    }
  }
}

function toString(this: Node.Node) {
  const stack = [this];
  const close = new WeakSet<Node.Node>();
  const acc = [] as string[];

  while (stack.length > 0) {
    const node = stack.pop()!;

    if (close.has(node)) {
      if (node._tag === TEXT_NODE) {
        continue;
      }
      const i = ' '.repeat(node.depth * 2);

      switch (node._tag) {
        case LIST_NODE: {
          acc.push(`${i}]`);
          continue;
        }
        case FRAGMENT: {
          acc.push(`${i}</>`);
          continue;
        }
        case INTRINSIC:
        case FUNCTIONAL: {
          acc.push(`${i}</${node.name}>`);
          continue;
        }
      }
    }
    const i = ' '.repeat(node.depth * 2);

    if (node._tag === TEXT_NODE) {
      acc.push(`${i}"${node.text}"`);
      continue;
    }

    if (!node.children || !node.children.length) {
      if (node._tag === LIST_NODE) {
        acc.push(`${i}[]`);
      }
      else if (node._tag === FRAGMENT) {
        acc.push(`${i}</>`);
      }
      else if (Object.keys(node.props).length === 0) {
        acc.push(`${i}<${node.name}/>`);
      }
      else {
        acc.push(`${i}<${node.name}`);

        for (const [k, v] of Object.entries(node.props)) {
          if (!v) {
            acc.push(`${i}  ${k}="${v}"`);
            continue;
          }
          switch (typeof v) {
            case 'function': {
              acc.push(`${i}  ${k}={${v.name}}`);
              continue;
            }
            case 'object': {
              if (Array.isArray(v)) {
                acc.push(`${i}  ${k}={[...${v.length}]}`);
                continue;
              }
              acc.push(`${i}  ${k}={...${Object.keys(v).length}}`);
              continue;
            }
            default: {
              acc.push(`${i}  ${k}="${v}"`);
            }
          }
        }
        acc.push(`${i}/>`);
      }
      continue;
    }

    close.add(node);
    stack.push(node);
    stack.push(...node.children);

    switch (node._tag) {
      case LIST_NODE: {
        acc.push(`${i}[`);
        continue;
      }
      case FRAGMENT: {
        acc.push(`${i}<>`);
        continue;
      }
    }
    if (Object.keys(node.props).length === 0) {
      acc.push(`${i}<${node.name}>`);
      continue;
    }
    acc.push(`${i}<${node.name}`);

    for (const [k, v] of Object.entries(node.props)) {
      if (!v) {
        acc.push(`${i}  ${k}="${v}"`);
        continue;
      }
      switch (typeof v) {
        case 'function': {
          acc.push(`${i}  ${k}={${v.name}}`);
          continue;
        }
        case 'object': {
          if (Array.isArray(v)) {
            acc.push(`${i}  ${k}={[...${v.length}]}`);
            continue;
          }
          acc.push(`${i}  ${k}={...${Object.keys(v).length}}`);
          continue;
        }
        default: {
          acc.push(`${i}  ${k}="${v}"`);
        }
      }
    }
    acc.push(`${i}>`);
  }
  return acc.join('\n');
};

const n1 = MutableRef.get;
