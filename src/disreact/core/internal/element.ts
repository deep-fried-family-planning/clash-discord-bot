import * as proto from '#disreact/core/behaviors/proto.ts';
import type * as Element from '#disreact/core/Element.ts';
import type * as FC from '#disreact/core/FC.ts';
import {ANONYMOUS, ASYNC, ELEMENT_FRAGMENT, ELEMENT_FUNCTIONAL, ELEMENT_INTRINSIC, ELEMENT_LIST, ELEMENT_TEXT, type FCExecution, INTERNAL_ERROR} from '#disreact/core/immutable/constants.ts';
import * as fc from '#disreact/core/internal/fn.ts';
import type * as Jsx from '#disreact/core/Jsx.ts';
import * as Traversal from '#disreact/core/Traversal.ts';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';
import type {Mutable} from 'effect/Types';

const FCPrototype = proto.type<FC.Known>({
  _id  : ANONYMOUS,
  state: true,
  props: true,
  ...Inspectable.BaseProto,
  ...Pipeable.Prototype,
  toJSON() {
    return Inspectable.format({
      _id  : 'FunctionComponent',
      name : this._id,
      state: this.state,
      props: this.props,
      cast : this._tag,
    });
  },
});

export const isFC = (u: unknown): u is FC.FC => typeof u === 'function';

export const registerFC = (fn: FC.FC): FC.Known => {
  if (isKnown(fn)) {
    return fn;
  }
  const fc = proto.impure(FCPrototype, fn);

  switch (fc.length) {
    case 0: {
      fc.props = false;
      break;
    }
    case 1: {
      fc.props = true;
      break;
    }
    case 2: {
      fc.props = true;
      fc.state = true;
    }
    default: {
      throw new Error(`register(${fn.name}): unknown function length ${fn.length}`);
    }
  }

  fc._id = fc.displayName ? fc.displayName :
           fc.name ? fc.name :
           ANONYMOUS;

  return proto.isAsync(fc)
         ? cast(fc, ASYNC)
         : fc;
};

export const isKnown = (u: FC.FC): u is FC.Known => !!(u as any)._tag;

export const isCasted = (self: FC.FC): self is FC.Known => !!(self as FC.Known)._tag;

export const cast = (self: FC.Known, type: FCExecution) => {
  if (isCasted(self)) {
    throw new Error(`Cannot recast function component: ${name(self)}`);
  }
  return Object.defineProperty(self, '_tag', {
    value       : type,
    writable    : false,
    configurable: false,
    enumerable  : true,
  });
};

export const isAnonymous = (self: FC.FC) => name(self) === ANONYMOUS;

export const overrideName = (self: FC.FC, name: string) => {
  (self as any)._id = name;
};

export const name = (maybe?: string | FC.FC) => {
  if (!maybe) {
    return ANONYMOUS;
  }
  if (!isFC(maybe)) {
    return maybe;
  }
  if (!isKnown(maybe)) {
    throw new Error(INTERNAL_ERROR);
  }
  return (maybe as any)._id as string;
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

export const isProps = (u: unknown): u is Element.Props => !!u && typeof u === 'object' && !Array.isArray(u);

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

export const ElementId = Symbol.for('disreact/element');

const ElementPrototype = proto.type<Element.Element>({
  [ElementId]: ElementId,
  _tag       : ELEMENT_INTRINSIC as any,
  component  : undefined as any,
  polymer    : undefined as any,
  props      : undefined as any,
  children   : undefined as any,
  key        : '',
  ref        : undefined,
  text       : undefined as any,
  merge      : false,
  diff       : undefined,
  diffs      : undefined,
  jsxs       : false,
  trie       : '',
  step       : '',
  index      : 0,
  depth      : 0,
  valence    : 0,
  height     : 0,
  head       : undefined,
  tail       : undefined,
  ancestor   : undefined,
  origin     : undefined,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON() {
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
  },
  toString,
});

export const create = () => proto.create(ElementPrototype) as Mutable<Element.Element>;

export const isElement = (u: unknown): u is Element.Element => !!u && typeof u === 'object' && ElementId in u;

export const isNodeNonPrimitive = (u: {}): u is Element.Element => ElementId in u;

export const makeTextElement = (text: any): Element.Text =>
  proto.init(
    ElementPrototype,
    {
      _tag     : ELEMENT_TEXT,
      component: undefined,
      text     : text,
    },
  ) as Element.Text;

export const makeListElement = (children: any[]): Element.List =>
  proto.init(
    ElementPrototype,
    {
      _tag     : ELEMENT_LIST,
      component: children.length,
      props    : makeProps({children}),
    },
  ) as Element.List;

export const FragmentSymbol = Symbol.for('disreact/fragment');

export const makeFragElement = (props: any, key?: string): Element.Frag =>
  proto.init(
    ElementPrototype,
    {
      _tag     : ELEMENT_FRAGMENT,
      component: FragmentSymbol,
      key      : key ?? props.key ?? '',
      props    : makeHandlerProps(props),
    },
  ) as Element.Frag;

export const makeRestElement = (type: string, props: any, key?: string): Element.Rest =>
  proto.init(
    ElementPrototype,
    {
      key      : key ?? props.key ?? '',
      _tag     : ELEMENT_INTRINSIC,
      component: type,
      props    : makeHandlerProps(props),
    },
  ) as Element.Rest;

export const makeFuncElement = (type: FC.FC, props: any, key?: string): Element.Func =>
  proto.init(
    ElementPrototype,
    {
      key      : key ?? props.key ?? '',
      _tag     : ELEMENT_FUNCTIONAL,
      component: registerFC(type),
      props    : makeProps(props),
    },
  ) as Element.Func;

export const makeChildElement = (type: Jsx.Children): Element.Element => {
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
  return type; // todo clone?
};

export const connectChildElement = <A extends Element.Element>(parent: Element.Element, child: A, head?: Element.Element): A => {
  child.depth = parent.depth + 1;
  if (head) {
    child.index = head.index + 1;
    Traversal.setSiblings(child, head);
  }
  child.origin = parent.origin;
  child.ancestor = parent.ancestor;
  return child;
};

export const integrateChildElement = <A extends Element.Element>(parent: Element.Element, child: A, head?: Element.Element): A => {
  const connected = connectChildElement(parent, child, head);
  return connected;
};

export const cloneElement = <A extends Element.Element>(self: A): A => {
  throw new Error();
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
