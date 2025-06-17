import * as Deps from '#src/disreact/codec/old/deps.ts';
import * as Const from '#src/disreact/model/internal/core/enum.ts';
import {COMP, REST, TEXT} from '#src/disreact/model/internal/core/enum.ts';
import type * as Polymer from '#src/disreact/model/internal/polymer.ts';
import * as Globals from '#src/disreact/model/internal/infrastructure/globals.ts';
import * as Prototype from '#src/disreact/model/internal/infrastructure/proto.ts';
import * as Array from 'effect/Array';
import type * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import type * as Inspectable from 'effect/Inspectable';
import * as MutableList from 'effect/MutableList';
import * as Pipeable from 'effect/Pipeable';
import console from 'node:console';
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

export const TypeId = Symbol.for('disreact/element'),
             SrcId  = Symbol.for('disreact/source'),
             DiffId = Symbol.for('disreact/diff');

interface Base extends Hash.Hash, Equal.Equal, Pipeable.Pipeable, Inspectable.Inspectable {
  [TypeId]: typeof TEXT | typeof REST | typeof COMP;
  [SrcId]?: string;
  type?   : any;
  $d      : number;
  $i      : number;
  $p      : number;
  _n?     : string;
  _s?     : string;
  props?  : Props;
  rs?     : Elements;
  text?   : any;
  name?   : string;
};

export type Primitive = | null
                        | undefined
                        | boolean
                        | number
                        | string
                        | symbol;

export interface Text extends Base {
  [TypeId]: typeof TEXT;
  text    : Primitive;
}

export interface Intrinsic extends Base {
  [TypeId]: typeof REST;
  type    : string;
  handler?: Event.Handler | undefined;
}

export interface Instance extends Base {
  [TypeId]: typeof COMP;
  type    : Fc;
  polymer?: Polymer.Polymer;
}

export type Element = | Text
                      | Intrinsic
                      | Instance;

export type Node = | Intrinsic
                   | Instance;

const ElementProto = Prototype.make<Base>({
  ...Pipeable.Prototype,
  // ...Inspectable.BaseProto,
  [Hash.symbol](this: Element) {
    return Hash.structure(this);
  },
  [Equal.symbol]: Prototype.structEquals,
});

const TextProto = Prototype.make<Text>({
  ...ElementProto,
  [TypeId]: TEXT,
});

const IntrinsicProto = Prototype.make<Intrinsic>({
  ...ElementProto,
  [TypeId]: REST,
});

const InstanceProto = Prototype.make<Instance>({
  ...ElementProto,
  [TypeId]: COMP,
});

export const isElement = (e: any): e is Element => typeof e === 'object' && e !== null && TypeId in e;

export const isText = (e: any): e is Text => e[TypeId] === TEXT;

export const isIntrinsic = (e: any): e is Intrinsic => e[TypeId] === REST;

export const isInstance = (e: any): e is Instance => e[TypeId] === COMP;

export const text = (text?: Primitive): Text =>
  Prototype.create(TextProto, {
    text: text,
  });

export const intrinsic = (type: string, atts: any): Intrinsic => {
  const handler = propsHandler(atts);

  return Prototype.create(IntrinsicProto, {
    type   : type,
    name   : type,
    props  : props(atts),
    handler: handler,
  });
};

export const instance = (type: Fc, atts: any): Instance => {
  const f = registerFc(type);

  const self = Prototype.create(InstanceProto, {
    [SrcId]: f[FcId]!,
    type   : f,
    name   : f[FcId]!,
  });
  self.props = props(atts, self);

  return self;
};

export const PropsId = Symbol.for('disreact/props');

export namespace Props {
  export type Obj = { [K in string]: any };
  export type Arr = Props.Any[];
  export type Any = | Props.Obj
                    | Props.Arr;
}

export type Props = Props.Obj;

const PropsStructProto = {
  [PropsId]: PropsId,
  [Hash.symbol](this: Props) {
    return Hash.structure(this);
  },
  [Equal.symbol](this: Props, that: Props) {
    if (!(PropsId in that) || that[PropsId] !== PropsId) {
      throw new Error();
    }
    const selfKeys = Object.keys(this);
    const thatKeys = Object.keys(that);
    if (selfKeys.length !== thatKeys.length) {
      return false;
    }
    for (const key of selfKeys) {
      if (!(key in that) || !Equal.equals(this[key], that[key])) {
        return false;
      }
    }
    return true;
  },
};

const PropsArrayProto = Prototype.array({
  [PropsId]: PropsId,
  [Hash.symbol](this: Props.Arr) {
    return Hash.array(this);
  },
  [Equal.symbol](this: Props.Arr, that: Props.Arr) {
    if (!(PropsId in that) || that[PropsId] !== PropsId) {
      throw new Error();
    }
    if (this.length !== that.length) {
      return false;
    }
    for (let i = 0; i < this.length; i++) {
      if (!Equal.equals(this[i], that[i])) {
        return false;
      }
    }
    return true;
  },
});

export const props = (p: any, fn?: Instance): Props => {
  if (fn) {
    if (Deps.isItem(p) || Deps.isFn(p)) {
      console.log('dingding', p);
    }
  }
  if (!p || typeof p !== 'object') {
    return p;
  }
  if (Array.isArray(p)) {
    const acc = [] as any[];
    for (let i = 0; i < p.length; i++) {
      acc.push(props(p[i]));
    }
    return Prototype.pure(PropsArrayProto, acc);
  }
  const acc = {} as any;
  for (const key of Object.keys(p)) {
    acc[key] = props(p[key]);
  }
  return Prototype.pure(PropsStructProto, acc);
};

export const rootProps = (p: any): Props => {
  const cloned = structuredClone(p);
  return props(cloned);
};

const HANDLER_KEYS = [
  'onclick',
  'onselect',
  'onsubmit',
];

const propsHandler = (props: any): Handler | undefined => {
  for (let i = 0; i < HANDLER_KEYS.length; i++) {
    const key = HANDLER_KEYS[i];
    const handler = props[key];

    if (handler) {
      delete props[key];
      return handler;
    }
  }
};

export const ElementsId = Symbol.for('disreact/elements');

export type Rendered = | Primitive
                       | Element
                       | (Primitive | Element)[];

type ElementsArray = Element[];

export interface Elements extends ElementsArray, Hash.Hash, Equal.Equal {
  [ElementsId]: typeof ElementsId;
};

const ElementsProto = Prototype.array<Elements>({
  [ElementsId]: ElementsId,
  [Hash.symbol](this: Elements) {
    return Hash.array(this);
  },
  [Equal.symbol](this: Elements, that: Elements) {
    if (that[ElementsId] !== ElementsId) {
      throw new Error();
    }
    return Prototype.arrayEquals(that);
  },
});

type Count = {
  t: number;
  r: Record<string, number>;
  p: number;
};

const emptyCount = (): Count =>
  ({
    t: 0,
    r: {},
    p: 0,
  });

const connect = (p: Element, n: Element, count: Count) => {
  if (!isElement(n)) {
    const t = text(n);
    t.$d = p.$d + 1;
    t.$p = count.p++;
    t.$i = count.t;
    Globals.registerOrigin(t, p);
    return t;
  }
  n.$d = p.$d + 1;
  n.$p = count.p++;
  n.$i = count.t;
  if (isIntrinsic(n)) {
    n.$i = count.r[n.name!] ??= 0;
    n._s = `${p.name}:${p.$i}:${n.name}:${n.$i}`;
    n._n = `${p._n}:${n.name}:${n.$i}`;
    count.r[n.name!]++;
  }
  else {
    n.$i = count.r[n.name!] ??= 0;
    n._s = `${p.name}:${p.$i}:${n.name}:${n.$i}`;
    n._n = `${p._n}:${n.name}:${n.$i}`;
    count.r[n.name!]++;
  }
  Globals.registerOrigin(n, p);
  return n;
};

export const trie = (p: Element, rs = p.rs): Elements => {
  const count = emptyCount(),
        cs    = Prototype.create(ElementsProto, Array.ensure(rs ?? []).flat() as any);

  let ids = new Set<string>();

  for (let i = 0; i < cs.length; i++) {
    cs[i] = connect(p, cs[i], count);
    if (ids.has(cs[i]._n!)) {
      throw new Error(`Duplicate trie id: ${cs[i]._n}`);
    }
    ids.add(cs[i]._n!);
  }
  (ids as any) = null;
  return cs as Elements;
};

export const update = (a: Element, b: Element) => {
  if (isText(a) && isText(b)) {
    a.text = b.text;
  }
  else if (isIntrinsic(a) && isIntrinsic(b)) {
    a.props = props(b.props);
  }
  else if (isInstance(a) && isInstance(b)) {
    a.props = props(b.props);
  }
  throw new Error();
};

export const replace = (a: Element, b: Element) => {
  const p = Globals.getOrigin<Element>(a);
  if (!p || !p.rs || p.rs[b.$p] !== a) {
    throw new Error();
  }
  p.rs![b.$p!] = b;
};

export const prepend = (p: Element, n: Element) => {
  p.rs!.unshift(n);
  return p;
};

export const append = (p: Element, n: Element) => {
  p.rs!.push(n);
  return p;
};

export const remove = (p: Element, pos: number) => {
  p.rs!.splice(pos, 1);
  return p;
};

export const insert = (p: Element, n: Element, pos: number) => {
  p.rs!.splice(pos, 0, n);
  return p;
};

export const accept = (p: Element, ns: Element[]) => {
  if (p.rs) {
    throw new Error();
  }
  return p;
};



export const FcId  = Symbol.for('disreact/fc'),
             RunId = Symbol.for('disreact/render');

export namespace Fc {
  export interface Base<P> extends Function {
    (props: P): Rendered | Promise<Rendered> | E.Effect<Rendered, any, any>;
    [FcId]?     : string;
    [RunId]?    : Const.FunctionType;
    displayName?: string;
  }
  export interface Known<P> extends Base<P> {
    [FcId]: string;
  }
  export interface Sync<P> extends Known<P> {
    (props: P): Rendered;
    [RunId]: typeof Const.SYNC;
  }
  export interface Async<P> extends Known<P> {
    (props: P): Promise<Rendered>;
    [RunId]: typeof Const.PROMISE;
  }
  export interface Effect<P> extends Known<P> {
    (props: P): E.Effect<Rendered, any, any>;
    [RunId]: typeof Const.EFFECT;
  }
  export type Any<P> = | Sync<P>
                       | Async<P>
                       | Effect<P>;
}

export type Fc<P = any> = Fc.Base<P>;

const registerFc = (fc: Fc) => {
  if (fc[FcId]) {
    return fc;
  }
  if (fc.displayName) {
    fc[FcId] = fc.displayName;
  }
  else if (fc.name) {
    fc[FcId] = fc.name;
  }
  else {
    fc[FcId] = Const.ANONYMOUS_FUNCTION;
  }
  if (fc.constructor.name === Const.ASYNC_FUNCTION) {
    fc[RunId] = Const.PROMISE;
  }
  return fc;
};

export const isFc = (e: any): e is Fc => !!e && typeof e === 'function' && e[FcId];

export const findFirst = (from: Element, fn: (e: Element) => boolean): Element | undefined => {
  let stack = MutableList.make<Element>(from);

  while (MutableList.head(stack)) {
    const n = MutableList.shift(stack)!;

    if (fn(n)) {
      return n;
    }

    const rs = n.rs?.toReversed();

    if (rs) {
      for (let i = 0; i < rs.length; i++) {
        MutableList.prepend(stack, rs[i]);
      }
    }
  }

  (stack as any) = null;
};

export const Fragment = undefined;

export const jsx = (type: any, atts: any): Element => {
  if (type === Fragment) {
    return atts.children;
  }
  switch (typeof type) {
    case 'string': {
      if (!atts.children) {
        return intrinsic(type, atts);
      }
      const children = atts.children;
      delete atts.children;
      const el = intrinsic(type, atts);
      el.rs = trie(el, [children] as any);
      return el;
    }
    case 'function': {
      return instance(type, atts);
    }
  }
  throw new Error(`Invalid element type: ${String(type)}`);
};

export const jsxs = (type: any, atts: any): Element => {
  if (type === Fragment) {
    return atts.children;
  }
  switch (typeof type) {
    case 'string': {
      const children = atts.children.flat();
      delete atts.children;
      const el = intrinsic(type, atts);
      el.rs = trie(el, children);
      return el;
    }
    case 'function': {
      return instance(type, atts);
    }
  }
  throw new Error(`Invalid element type: ${String(type)}`);
};

export const jsxDEV = (type: any, atts: any): Element => {
  if (Array.isArray(atts.children)) {
    return jsxs(type, atts);
  }
  return jsx(type, atts);
};

export type Source = Element & {
  [SrcId]?: string;
};

const registerSourceFC = (type: Fc, atts: Props = {}): Source => {
  const element = jsxDEV(type, atts) as Instance;

  if (element.props?.source) {
    const id = element.props.source;
    element[SrcId] = id;
    element.type[FcId] = id;
    delete element.props.source;
    return element;
  }
  if (element.type[FcId] === Const.ANONYMOUS_FUNCTION) {
    throw new Error('Anonymous function component cannot be a source element.');
  }
  element[SrcId] = element.type[FcId]!;
  return element;
};

const registerSourceElement = (type: Element): Source => {
  if (isText(type)) {
    throw new Error('Root text element cannot be a source element.');
  }
  if (isIntrinsic(type)) {
    if (type.props?.source) {
      throw new Error('Root rest element must have a "source" prop to be a source element.');
    }
    type[SrcId] = type.props!.source;
    delete type.props!.source;
    return type;
  }
  if (!type.props?.source) {
    if (type.type[FcId] === Const.ANONYMOUS_FUNCTION) {
      throw new Error('Anonymous function component cannot be a source element.');
    }
    type[SrcId] = type.type[FcId]!;
    return type;
  }
  type[SrcId] = type.props!.source;
  type.type[FcId] = type[SrcId]!;
  delete type.props!.source;
  return type;
};

export const registerSource = (type: Element | Fc, atts?: Props): Source => {
  if (isElement(type)) {
    return registerSourceElement(type);
  }
  return registerSourceFC(type, atts);
};

export const getSourceId = (type: Element | Fc): string | undefined => {
  if (isFc(type)) {
    return type[FcId];
  }
  if (isInstance(type)) {
    return type[SrcId] ?? type.type[FcId];
  }
  return type[SrcId];
};

export const createRootFromSource = (source: Source, atts?: Props): Element => {
  if (!source[SrcId]) {
    throw new Error(`Invalid source element ${source.name}`);
  }
  const props = rootProps(atts ?? source.props);
  const element = jsxDEV(source.type, props);
  element[SrcId] = source[SrcId];
  element.$d = 0;
  element.$i = 0;
  element.$p = 0;
  element._n = `${element.name}:${0}`;
  element._s = `${element.name}:${0}`;
  return element;
};

export const createRootFromFC = (type: Fc, atts: Props): Instance => {
  const props = rootProps(atts);
  const el = jsxDEV(type, props) as Instance;
  el.$d = 0;
  el.$i = 0;
  el.$p = 0;
  el._n = `${el.name}:${0}`;
  el._s = `${el.name}:${0}`;
  return el;
};

export namespace Event {
  export type Event = {
    id  : string;
    data: any;
  };

  export interface Handler extends Function {
    (event: Event.Event): void | Promise<void> | E.Effect<void, any, any>;
  }
}
export type Event = Event.Event;
export type Handler = Event.Handler;

export const event = (id: string, data: any): Event.Event =>
  ({
    id,
    data,
  });

//
// type M<A> = {
//   text: (n: Text) => A;
//   rest: (n: Rest) => A;
//   comp: (n: Component) => A;
// };
// export const match = F.dual<<A>(m: M<A>) => (n: Element) => A, <A>(n: Element, m: M<A>) => A>(
//   2,
//   (n, m) => {
//     if (isText(n)) {
//       return m.text(n);
//     }
//     else if (isRest(n)) {
//       return m.rest(n);
//     }
//     return m.comp(n);
//   },
// );

export const lca = (es: Instance[]): Instance | undefined => {
  switch (es.length) {
    case 0: {
      return undefined;
    }
    case 1: {
      return es[0];
    }
  }
  return es[0] as Instance;
};
