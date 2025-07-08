import type * as Element from '#disreact/core/Element.ts';
import type * as FC from '#disreact/core/FC.ts';
import {ELEMENT_FRAGMENT, ELEMENT_FUNCTIONAL, ELEMENT_INTRINSIC, ELEMENT_LIST, ELEMENT_TEXT} from '#disreact/core/immutable/constants.ts';
import * as fc from '#disreact/core/internal/fn.ts';
import * as Traversal from '#disreact/core/Traversal.ts';
import * as proto from '#src/disreact/core/behaviors/proto.ts';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';
import type {Mutable} from 'effect/Types';

export const TypeId = Symbol.for('disreact/element');

export const FragmentSymbol = Symbol.for('disreact/fragment');

const Prototype = proto.type<Element.Element>({
  [TypeId] : TypeId,
  _tag     : ELEMENT_INTRINSIC as any,
  component: undefined as any,
  polymer  : undefined as any,
  props    : undefined as any,
  children : undefined as any,
  key      : '',
  ref      : undefined,
  text     : undefined as any,
  merge    : false,
  diff     : undefined,
  diffs    : undefined,
  jsxs     : false,
  trie     : '',
  step     : '',
  index    : 0,
  depth    : 0,
  valence  : 0,
  height   : 0,
  head     : undefined,
  tail     : undefined,
  ancestor : undefined,
  origin   : undefined,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON,
  toString,
});

export const isElement = (u: unknown): u is Element.Element => !!u && typeof u === 'object' && TypeId in u;

export const isNodeNonPrimitive = (u: {}): u is Element.Element => TypeId in u;

export const text = (text: any): Element.Text =>
  proto.init(
    Prototype,
    {
      _tag     : ELEMENT_TEXT,
      component: undefined,
      text     : text,
    },
  ) as Element.Text;

export const list = (children: unknown[]): Element.List =>
  proto.init(
    Prototype,
    {
      _tag     : ELEMENT_LIST,
      component: children.length,
      children : children.map(makeChild),
    },
  ) as Element.List;

export const frag = (props: any, key?: string): Element.Frag =>
  proto.init(
    Prototype,
    {
      _tag     : ELEMENT_FRAGMENT,
      component: FragmentSymbol,
      key      : key ?? props.key ?? '',
      props    : makeHandlerProps(props),
    },
  ) as Element.Frag;

export const rest = (type: string, props: any, key?: string): Element.Rest =>
  proto.init(
    Prototype,
    {
      key      : key ?? props.key ?? '',
      _tag     : ELEMENT_INTRINSIC,
      component: type,
      props    : makeHandlerProps(props),
    },
  ) as Element.Rest;

export const func = (type: FC.FC, props: any, key?: string): Element.Func =>
  proto.init(
    Prototype,
    {
      key      : key ?? props.key ?? '',
      _tag     : ELEMENT_FUNCTIONAL,
      component: fc.register(type),
      props    : makeProps(props),
    },
  ) as Element.Func;

export const create = () => proto.create(Prototype) as Mutable<Element.Element>;

export const connect = (parent: Element.Element, child: Element.Element, head?: Element.Element) => {
  child.depth = parent.depth + 1;

  Traversal.setOrigin(child, parent);
  Traversal.setAncestor(child, parent);
  if (head) {
    Traversal.setSiblings(head, child);
    child.index = head.index + 1;
  }
  return child;
};

export const clone = <A extends Element.Element>(self: A | unknown): A => {
  if (!isElement(self)) {
    throw new Error(`[Node.clone]: unknown type ${self}`);
  }
  const element = create();
  element._tag = self._tag;
  element.component = self.component;
  element.key = self.key;
  element.ref = self.ref;
  element.depth = self.depth;
  if (element._tag === ELEMENT_TEXT) {
    element.text = self.text;
    return element as A;
  }
  if (element._tag === ELEMENT_LIST) {
    element.children = self.children?.map(clone) ?? [];
    return element as A;
  }
  if (element._tag === ELEMENT_FRAGMENT) {
    element.component = self.component;
    element.children = self.children?.map(clone) ?? [];
    return element as A;
  }
  if (element._tag === ELEMENT_INTRINSIC) {
    element.component = self.component;
    element.props = makeProps({...self.props});
    return element as A;
  }
  element;
  return element as A;
};

export const makeChild = (type: unknown): Element.Element => {
  if (!type || typeof type !== 'object') {
    const element = create();
    element._tag = ELEMENT_TEXT;
    element.text = type;
    return element;
  }
  if (Array.isArray(type)) {
    const element = create();
    element._tag = ELEMENT_LIST;
    element.props = makeProps({children: type});
    return element;
  }
  if (isElement(type)) {
    return type; // todo clone
  }
  throw new Error(`Unknown child type: ${type}`);
};

export const makeChildClone = (type: unknown): Element.Element => {
  if (!type || typeof type !== 'object') {
    return text(type);
  }
  if (Array.isArray(type)) {
    return list(type);
  }
  return;
};

export const makeChilds = (type: unknown[]): Element.Element[] => {
  const childs = [] as Element.Element[];

  for (let i = 0; i < type.length; i++) {
    const element = makeChild(type[i]);
    childs.push(element);
  }
  return childs;
};

export const connectChild = (parent: Element.Element, type: unknown) => {
  const child = makeChild(type);
  Traversal.setOrigin(child, parent);
  Traversal.setAncestor(child, parent);
  return child;
};

export const connectChildren = (parent: Element.Element, children: unknown | unknown[]) => {
  if (Array.isArray(children)) {
    const acc = [] as Element.Element[];
    for (let i = 0; i < children.length; i++) {
      const child = makeChild(children[i]);
      child.index = i;
      Traversal.setOrigin(child, parent);
      Traversal.setAncestor(child, parent);
      Traversal.setSiblings(acc[i - 1], child);
      acc.push(child);
    }
    return acc;
  }
  const element = makeChild(children);
  Traversal.setOrigin(element, parent);
  Traversal.setAncestor(element, parent);
  return parent;
};

export const liftPropsChildren = (self: Element.Element) => {
  if (self._tag === ELEMENT_TEXT) {
    return self;
  }
  if (self._tag === ELEMENT_LIST) {
    return self;
  }
};

const PropsPrototype = proto.type<Element.Props>({
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
    return proto.structEquals(this, that); // todo ignore children? ignore ref?
  },
});

export const makeProps = proto.initDL(PropsPrototype);

export const makeHandlerProps = (input: any): Element.Props => {
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

function toJSON(this: Element.Element) {
  switch (this._tag) {
    case ELEMENT_TEXT: {
      return Inspectable.format({
        _id : 'Node',
        _tag: 'Text',
        text: this.text,
      });
    }
    case ELEMENT_LIST: {
      return Inspectable.format({
        _id     : 'Node',
        _tag    : 'List',
        children: this.children,
      });
    }
    case ELEMENT_FRAGMENT: {
      return Inspectable.format({
        _id     : 'Node',
        _tag    : 'Fragment',
        children: this.children,
      });
    }
    case ELEMENT_INTRINSIC: {
      return Inspectable.format({
        _id      : 'Node',
        _tag     : 'REST',
        component: this.component,
        props    : this.props,
        children : this.children,
      });
    }
    case ELEMENT_FUNCTIONAL: {
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

function toString(this: Element.Element) {
  const stack = [this];
  const close = new WeakSet<Element.Element>();
  const acc = [] as string[];

  while (stack.length > 0) {
    const node = stack.pop()!;

    if (close.has(node)) {
      const c = toStringClose(node);
      if (c) {
        acc.push(c);
      }
      continue;
    }
    const i = ' '.repeat(node.depth * 2);

    if (node._tag === ELEMENT_TEXT) {
      acc.push(`${i}"${node.text}"`);
      continue;
    }

    if (!node.children || !node.children.length) {
      if (node._tag === ELEMENT_LIST) {
        acc.push(`${i}[]`);
      }
      else if (node._tag === ELEMENT_FRAGMENT) {
        acc.push(`${i}</>`);
      }
      else if (Object.keys(node.props).length === 0) {
        acc.push(`${i}<${node.component}/>`);
      }
      else {
        acc.push(`${i}<${node.component}`);

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
    stack.push(...node.children.toReversed());

    if (node._tag === ELEMENT_LIST) {
      acc.push(`${i}[`);
      continue;
    }
    if (node._tag === ELEMENT_FRAGMENT) {
      acc.push(`${i}<>`);
      continue;
    }
    if (Object.keys(node.props).length === 0) {
      acc.push(`${i}<${node.component}>`);
      continue;
    }

    acc.push(`${i}<${node.component}`);

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

function toStringClose(node: Element.Element) {
  if (node._tag === ELEMENT_TEXT) {
    return undefined;
  }
  const i = ' '.repeat(node.depth * 2);

  if (node._tag === ELEMENT_LIST) {
    return `${i}]`;
  }
  if (node._tag === ELEMENT_FRAGMENT) {
    return `${i}</>`;
  }
  if (node._tag === ELEMENT_INTRINSIC) {
    return `${i}</${node.component}>`;
  }
  return `${i}</${node.component.name}>`;
}

function toStringSelfClose(node: Element.Element) {
  if (node._tag === ELEMENT_TEXT) {
    return undefined;
  }
  const i = ' '.repeat(node.depth * 2);
  if (node._tag === ELEMENT_LIST) {
    return `${i}[]`;
  }
  if (node._tag === ELEMENT_FRAGMENT) {
    return `${i}</>`;
  }
  if (node._tag === ELEMENT_INTRINSIC) {
    return `${i}</${node.component}>`;
  }
  return `${i}</${node.component.name}>`;
}

function toStringProps(node: Element.Element) {

}

// todo object.create
//
// const ITERATIONS = 10_000_000;
// const ITERATIONS = 10;
//
// console.time('object-create');
// for (let i = 0; i < ITERATIONS; i++) {
//   if (Prototype.component === 'div') {
//     throw new Error();
//   }
//   const el = Object.create(Prototype);
//   el.component = 'div';
//   el.props = {};
//   console.log(el.component);
//   console.log(el.props);
//   console.log(Prototype.component);
//   console.log(Prototype.props);
// }
// console.timeEnd('object-create');
//
// console.time('object-literal');
// for (let i = 0; i < ITERATIONS; i++) {
//   const el = { ...Prototype, type: 'div', props: {} };
// }
// console.timeEnd('object-literal');
//
// console.time('object-assign');
// for (let i = 0; i < ITERATIONS; i++) {
//   const el = Object.assign({}, Prototype, { type: 'div', props: {} });
// }
// console.timeEnd('object-assign');

const EventPrototype = proto.type<Element.Event>({
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id  : 'Event',
      value: this,
    });
  },
});

export const event = (
  id: string,
  lookup: string,
  event: string,
  data: any,
  target: Element.Element,
): Element.Event => {};
