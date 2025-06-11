import type * as El from '#src/disreact/model/entity/element.ts';
import type * as FC from '#src/disreact/model/entity/fc.ts';
import {extend} from '#src/disreact/model/entity/proto.ts';
import * as Const from '#src/disreact/model/util/const.ts';
import * as Deps from '#src/disreact/model/util/deps.ts';
import * as Proto from '#src/disreact/model/entity/proto.ts';
import * as Array from 'effect/Array';
import type * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';
import * as GlobalValue from 'effect/GlobalValue';
import * as Hash from 'effect/Hash';
import * as MutableList from 'effect/MutableList';
import * as Order from 'effect/Order';
import console from 'node:console';
import {inspect} from 'node:util';
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

export type Primitive = | null
                        | undefined
                        | boolean
                        | number
                        | string
                        | symbol;

export const TypeId = Symbol.for('disreact/element'),
             SrcId  = Symbol.for('disreact/source'),
             PropId = Symbol.for('disreact/props'),
             FuncId = Symbol.for('disreact/fc'),
             KindId = Symbol.for('disreact/fc/kind');

export type Element = | Text
                      | Rest
                      | Component;

export type Node = | Rest
                   | Component;

export interface Base {
  [TypeId]: Const.ElementType;
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

export interface Text extends Base {
  [TypeId]: typeof Const.TEXT;
  text    : Primitive;
}

export interface Rest extends Base {
  [TypeId]: typeof Const.REST;
  type    : string;
  handler?: Event.Handler | undefined;
}

export interface Component extends Base {
  [TypeId]: typeof Const.COMP;
  type    : Fc;
}

const ElementProto = Proto.make<Element>({
  $d: 0,
  $i: 0,
  $p: 0,
});

const TextProto = Proto.extend<Text>(ElementProto, {
  [TypeId]: Const.TEXT,
  [Hash.symbol](this: Element) {
    return Hash.structure(this); // todo
  },
  [Equal.symbol](this: Text, that: Text) {
    if (!(TypeId in that)) {
      throw new Error();
    }
    if (that[TypeId] !== Const.TEXT || this.text !== that.text) {
      return false;
    }
    return true; // todo
  },
});

const RestProto = Proto.extend<Rest>(ElementProto, {
  [TypeId]: Const.REST,
  [Hash.symbol](this: Element) {
    return Hash.structure(this); // todo
  },
  [Equal.symbol](this: Rest, that: Rest) {
    if (!(TypeId in that)) {
      throw new Error();
    }
    if (that[TypeId] !== Const.REST) {
      return false;
    }
    if (this.type !== that.type) {
      return false;
    }
    if (!Equal.equals(this.props, that.props)) {
      return false;
    }
    return true; // todo
  },
});

const ComponentProto = Proto.extend<Component>(ElementProto, {
  [TypeId]: Const.COMP,
  [Hash.symbol](this: Element) {
    return Hash.structure(this); // todo
  },
  [Equal.symbol](this: Component, that: Component) {
    if (!(TypeId in that)) {
      throw new Error();
    }
    if (that[TypeId] !== Const.COMP || this.type !== that.type) {
      return false;
    }
    if (!Equal.equals(this.props, that.props)) {
      return false;
    }
    return true; // todo
  },
});

export const isElem = (e: any): e is Element => typeof e === 'object' && e !== null && TypeId in e;

export const isText = (e: any): e is Text => e[TypeId] === Const.TEXT;

export const isRest = (e: any): e is Rest => e[TypeId] === Const.REST;

export const isComponent = (e: any): e is Component => e[TypeId] === Const.COMP;

const text = (text?: Primitive): Text =>
  Proto.create<Text>(
    TextProto,
    {
      text: text,
    },
  );

const rest = (type: string, atts: any): Rest => {
  const handler = propsHandler(atts);
  return Proto.create<Rest>(
    RestProto,
    {
      type   : type,
      name   : type,
      props  : props(atts),
      handler: handler,
    },
  );
};

const component = (type: Fc, atts: any): Component => {
  const f = registerFc(type);

  const self = Proto.create<Component>(
    ComponentProto,
    {
      [SrcId]: f[FcId]!,
      type   : f,
      name   : f[FcId]!,
    },
  );
  self.props = props(atts, self);

  return self;
};

export const ElementsId = Symbol('disreact/elements');

export namespace Elements {
  export type Primitive = | null
                          | undefined
                          | boolean
                          | number
                          | string
                          | symbol;
  export type Jsx1 = | Primitive
                     | Element;
  export type Jsxs = | Jsx1[]
                     | Jsxs[];
  export type Rendered = | Jsx1
                         | Jsx1[];
  export type Elements = Element[];
}

export interface Elements extends Elements.Elements {
  [ElementsId]: typeof ElementsId;
};

const ElementsProto: Elements = Proto.array({
  [ElementsId]: ElementsId,
  [Hash.symbol](this: Elements) {
    return Hash.array(this);
  },
  [Equal.symbol](this: Elements, that: Elements) {
    if (that[ElementsId] !== ElementsId) {
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

const parents = GlobalValue.globalValue(
  Symbol.for('disreact/el/parents'),
  () => new WeakMap<Element, Node>(),
);

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
  if (!isElem(n)) {
    const t = text(n);
    t.$d = p.$d + 1;
    t.$p = count.p++;
    t.$i = count.t;
    return t;
  }
  n.$d = p.$d + 1;
  n.$p = count.p++;
  n.$i = count.t;
  if (isRest(n)) {
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
  return n;
};

export const trie = (p: Element, rs = p.rs): Elements => {
  const count = emptyCount(),
        cs    = Proto.create(ElementsProto, Array.ensure(rs ?? []).flat() as any);

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
  else if (isRest(a) && isRest(b)) {
    a.props = props(b.props);
  }
  else if (isComponent(a) && isComponent(b)) {
    a.props = props(b.props);
  }
  throw new Error();
};

export const replace = (a: Element, b: Element) => {
  const p = parents.get(a);
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

export const order = <A extends Element>() =>
  Order.combineAll([
    Order.mapInput(Order.number, (e: A) => e.$d),
    Order.mapInput(Order.number, (e: A) => e.$p),
  ]);

const HANDLER_KEYS = [
  'onclick',
  'onselect',
  'onsubmit',
];

export const PropsId = Symbol.for('disreact/props');

export namespace Props {
  export type Jsx1 = Props.Obj & {children?: Element};
  export type Jsxs = Props.Obj & {children: Element[]};
  export type Obj = { [K in string]: any };
  export type Arr = Props.Any[];
  export type Any = | Props.Obj
                    | Props.Arr;
}

export type Props = Props.Obj;

const PropsStructProto = {
  [PropsId]: PropsId,
  [Hash.symbol](this: Props.Obj) {
    return Hash.structure(this);
  },
  [Equal.symbol](this: Props.Obj, that: Props.Obj) {
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

const PropsArrayProto = Proto.array({
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

export const props = (p: any, fn?: Component): Props => {
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
    return Proto.pure(PropsArrayProto, acc);
  }
  const acc = {} as any;
  for (const key of Object.keys(p)) {
    acc[key] = props(p[key]);
  }
  return Proto.pure(PropsStructProto, acc);
};

export const rootProps = (p: any): Props => {
  const cloned = structuredClone(p);
  return props(cloned);
};

const propsHandler = (props: any): El.Handler | undefined => {
  for (let i = 0; i < HANDLER_KEYS.length; i++) {
    const key = HANDLER_KEYS[i];
    const handler = props[key];

    if (handler) {
      delete props[key];
      return handler;
    }
  }
};

export const FcId  = Symbol.for('disreact/fc'),
             RunId = Symbol.for('disreact/render');

export namespace Fc {
  export interface Base<P> extends Function {
    (props: P): Elements.Rendered | Promise<Elements.Rendered> | E.Effect<Elements.Rendered, any, any>;
    [FcId]?     : string;
    [RunId]?    : Const.FunctionType;
    displayName?: string;
  }
  export interface Known<P> extends Base<P> {
    [FcId]: string;
  }
  export interface Sync<P> extends Known<P> {
    (props: P): Elements.Rendered;
    [RunId]: typeof Const.SYNC;
  }
  export interface Async<P> extends Known<P> {
    (props: P): Promise<Elements.Rendered>;
    [RunId]: typeof Const.PROMISE;
  }
  export interface Effect<P> extends Known<P> {
    (props: P): E.Effect<Elements.Rendered, any, any>;
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

export const fcId = (fc: Fc): string => fc[FcId]!;

export const sourceId = (source: Element): string => source[SrcId]!;

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
        return rest(type, atts);
      }
      const children = atts.children;
      delete atts.children;
      const el = rest(type, atts);
      el.rs = trie(el, [children] as any);
      return el;
    }
    case 'function': {
      return component(type, atts);
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
      const el = rest(type, atts);
      el.rs = trie(el, children);
      return el;
    }
    case 'function': {
      return component(type, atts);
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

export const registerSource = (input: Fc | Element, atts?: Props): string => {
  if (typeof input === 'function') {
    const name = input[FcId];

    if (!atts?.source) {

    }
    return;
  }
  switch (input[TypeId]) {
    case Const.REST: {
      if (input[SrcId]) {
        return input[SrcId]!;
      }
      if (input.props?.source) {
        const id = input.props.source;
        input[SrcId] = id;
        return id;
      }
    }
    case Const.COMP: {

    }
  }
  throw new Error('Text element cannot be a source.');
};

export const createSource = (type: Fc | Element, atts?: Props): Element => {
  if (isElem(type)) {
    const props = rootProps(type.props);
    if (!props.source) {
      throw new Error();
    }
    const element = jsxDEV(type.type, props);
    element[SrcId] = element.props!.source;
    delete element.props!.source;
    return element;
  }

  if (!atts) {
    throw new Error();
  }
  const props = rootProps(atts);
  const element = jsxDEV(type, props) as Component;

  if (!props.source) {
    const id = element.type[FcId];
    if (!id || id === Const.ANONYMOUS_FUNCTION) {
      throw new Error();
    }
    element[SrcId] = id;
  }
  else {
    if (element.type[FcId] !== element.props!.source) {
      element.type[FcId] = element.props!.source;
    }
    element[SrcId] = element.props!.source;
    delete element.props!.source;
  }
  return element;
};

export const sourceRoot = (source: Element, atts?: Props): Element => {
  if (!source[SrcId]) {
    throw new Error();
  }
  const props = rootProps(atts ?? source.props);
  const element = jsxDEV(source.type, props);
  element[SrcId] = source[SrcId];
  element.$d = 0;
  element.$i = 0;
  element.$p = 0;
  element._n = `${element.name}:${0}`;
  element._s = `${element.name}:${0}`;
  return jsxDEV(source.type, props);
};

export const createRoot = (type: FC.FC, atts: Props): Component => {
  const props = rootProps(atts);
  const el = jsxDEV(type, props) as Component;
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
