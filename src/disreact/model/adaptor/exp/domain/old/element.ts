import * as Deps from '#src/disreact/codec/old/deps.ts';
import * as FC from '#src/disreact/model/internal/infrastructure/fc.ts';
import type * as Polymer from '#src/disreact/model/internal/polymer.ts';
import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import {INTERNAL_ERROR} from '#src/disreact/model/internal/infrastructure/proto.ts';
import * as Array from 'effect/Array';
import type * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';
import * as Equivalence from 'effect/Equivalence';
import {dual} from 'effect/Function';
import * as GlobalValue from 'effect/GlobalValue';
import * as Hash from 'effect/Hash';
import * as Inspectable from 'effect/Inspectable';
import * as MutableList from 'effect/MutableList';
import * as Pipeable from 'effect/Pipeable';
import type * as P from 'effect/Predicate';

export const PropsTypeId = Symbol.for('disreact/props');

const parents = GlobalValue.globalValue(
  Symbol.for('disreact/parents'),
  () => new WeakMap<Element, Element>(),
);

export const ParentId = Symbol.for('disreact/parent');

function parent(this: Element, parent?: Element | null): Element | undefined {
  if (parent === null) {
    parents.delete(this);
  }
  else if (parent) {
    parents.set(this, parent);
  }
  return parents.get(this);
}

export const lca = (ns: Func[]): Func | undefined => {
  switch (ns.length) {
    case 0: {
      return undefined;
    }
    case 1: {
      return ns[0];
    }
  }

  let a: Element | undefined = ns[0];

  for (let i = 1; i < ns.length; i++) {
    if (!a) {
      throw new Error(INTERNAL_ERROR);
    }
    let c: Element | undefined = a;

    const as = new Set<Element>();

    while (c) {
      as.add(c);
      c = c.getParent();
    }

    c = ns[i];

    while (c) {
      if (as.has(c)) {
        a = c;
        break;
      }
      c = c.getParent();
    }
    a = c;
  }

  while (a && !isFunc(a)) {
    a = a.getParent();
  }

  if (!a) {
    throw new Error(INTERNAL_ERROR);
  }

  return a;
};

function getParent(this: Element): Element | undefined {
  return parents.get(this);
};

function setParent(this: Element, parent: Element | null): void {
  if (parent === null) {
    parents.delete(this);
  }
  else {
    parents.set(this, parent);
  }
}

export namespace Props {
  export type Obj = { [K in string]: any };
  export type Arr = Props.Any[];
  export type Any = | Props.Obj
                    | Props.Arr;
}

export type Props = Props.Obj;

export const isProps = (u: unknown): u is Props => typeof u === 'object' && u !== null && PropsTypeId in u;

export const isPropsStruct = (u: Props): u is Props.Obj => isProps(u) && !Array.isArray(u);

export const isPropsArray = (u: Props): u is Props.Arr => isProps(u) && Array.isArray(u);

const Props = proto.declare<Props>({
  [PropsTypeId]: PropsTypeId,
  ...Inspectable.BaseProto,
});

const PropsStructProto = {
  [PropsTypeId]: PropsTypeId,
  [Hash.symbol](this: Props) {
    return Hash.structure(this);
  },
  [Equal.symbol](this: Props, that: Props) {
    if (!(PropsTypeId in that) || that[PropsTypeId] !== PropsTypeId) {
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

const PropsArrayProto = proto.declareArray({
  [PropsTypeId]: PropsTypeId,
  [Hash.symbol](this: Props.Arr) {
    return Hash.array(this);
  },
  [Equal.symbol](this: Props.Arr, that: Props.Arr) {
    if (!(PropsTypeId in that) || that[PropsTypeId] !== PropsTypeId) {
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

export const props = (p: any, fn?: Func): Props => {
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
    return proto.pure(PropsArrayProto, acc);
  }
  const acc = {} as any;
  for (const key of Object.keys(p)) {
    acc[key] = props(p[key]);
  }
  return proto.pure(PropsStructProto, acc);
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

export const TypeId  = Symbol.for('disreact/element'),
             TEXT    = 1,
             REST    = 2,
             FUNC    = 3,
             NodesId = Symbol.for('disreact/nodes'),
             SrcId   = Symbol.for('disreact/source');

export interface Base extends Pipeable.Pipeable,
  Hash.Hash,
  Equal.Equal,
  Inspectable.Inspectable
{
  [TypeId]: typeof TEXT | typeof REST | typeof FUNC;
  [SrcId]?: string;
  type?   : any;
  $d      : number;
  $i      : number;
  $p      : number;
  _n?     : string;
  _s?     : string;
  props?  : Props;
  under?  : Nodes;
  text?   : any;
  name?   : string;
  parent(parent?: Element | null): Element | undefined;
  getParent(): Element | undefined;
  setParent(parent: Element | null): void;
};

export interface Text extends Base {
  [TypeId]: typeof TEXT;
  text    : Primitive;
}

export interface Rest extends Base {
  [TypeId]: typeof REST;
  type    : string;
  handler?: Event.Handler | undefined;
}

export interface Func extends Base {
  [TypeId]: typeof FUNC;
  type    : FC.Known;
  polymer?: Polymer.Polymer;
}

export type Element =
  | Text
  | Rest
  | Func;

export type Primitive =
  | null
  | undefined
  | boolean
  | number
  | string
  | symbol;

export type Rendered =
  | Primitive
  | Element
  | (Primitive | Element)[];

export const isElem = (e: unknown): e is Element => typeof e === 'object' && e !== null && TypeId in e;

export const isFunc = (e: Element): e is Func => e[TypeId] === FUNC;

export const isRest = (e: Element): e is Rest => e[TypeId] === REST;

export const isText = (e: Element): e is Text => e[TypeId] === TEXT;

const Base = proto.declares<Base>(
  Pipeable.Prototype,
  Inspectable.BaseProto,
  {
    [TypeId]: TypeId as any,
    getParent,
    setParent,
  },
);

const Func = proto.declare<Func>({
  ...Base,
  [TypeId]: FUNC,
});

const Rest = proto.declare<Rest>({
  ...Base,
  [TypeId]: REST,
});

const Text = proto.declare<Text>({
  ...Base,
  [TypeId]: TEXT,
});

export const func = (type: FC.FC, atts: any): Func => {
  const fc = FC.register(type);

  const self = proto.init(Func, {
    [SrcId]: FC.name(fc),
    type   : fc,
    name   : FC.name(fc),
  });
  self.props = props(atts, self);

  return self;
};

export const rest = (type: string, atts: any): Rest => {
  const handler = propsHandler(atts);

  const self = proto.init(Rest, {
    type   : type,
    name   : type,
    props  : props(atts),
    handler: handler,
  });

  return self;
};

export const text = (text?: Primitive): Text => {
  const self = proto.init(Text, {
    text: text,
  });

  return self;
};

type NodesArray = Element[];

export interface Nodes extends NodesArray, Hash.Hash, Equal.Equal {
  [NodesId]: typeof NodesId;
};

const ElementsProto = proto.declareArray<Nodes>({
  [NodesId]: NodesId,
  [Hash.symbol](this: Nodes) {
    return Hash.array(this);
  },
  [Equal.symbol](this: Nodes, that: Nodes) {
    if (that[NodesId] !== NodesId) {
      throw new Error();
    }
    return proto.arrayEquals(this, that);
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
  if (!isElem(n)) {
    const t = text(n);
    t.$d = p.$d + 1;
    t.$p = count.p++;
    t.$i = count.t;
    t.setParent(p);
    return t;
  }
  n.$d = p.$d + 1;
  n.$p = count.p++;
  n.$i = count.t;
  n.setParent(p);
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

export const trie = (p: Element, rs = p.under): Nodes => {
  const count = emptyCount(),
        cs    = proto.init(ElementsProto, Array.ensure(rs ?? []).flat() as any);

  let ids = new Set<string>();

  for (let i = 0; i < cs.length; i++) {
    cs[i] = connect(p, cs[i], count);
    if (ids.has(cs[i]._n!)) {
      throw new Error(`Duplicate trie id: ${cs[i]._n}`);
    }
    ids.add(cs[i]._n!);
  }
  (ids as any) = null;
  return cs as Nodes;
};

export const update = (a: Element, b: Element) => {
  if (isText(a) && isText(b)) {
    a.text = b.text;
  }
  else if (isRest(a) && isRest(b)) {
    a.props = props(b.props);
  }
  else if (isFunc(a) && isFunc(b)) {
    a.props = props(b.props);
  }
  throw new Error();
};

export const replace = (a: Element, b: Element) => {
  const p = a.getParent();
  if (!p || !p.under || p.under[b.$p] !== a) {
    throw new Error();
  }
  p.under![b.$p!] = b;
};

export const prepend = (p: Element, n: Element) => {
  p.under!.unshift(n);
  return p;
};

export const append = (p: Element, n: Element) => {
  p.under!.push(n);
  return p;
};

export const remove = (p: Element, pos: number) => {
  p.under!.splice(pos, 1);
  return p;
};

export const insert = (p: Element, n: Element, pos: number) => {
  p.under!.splice(pos, 0, n);
  return p;
};

export const accept = (p: Element, ns: Element[]) => {
  if (p.under) {
    throw new Error();
  }
  return p;
};

export const findFirst = (from: Element, fn: (e: Element) => boolean): Element | undefined => {
  let stack = MutableList.make<Element>(from);

  while (MutableList.head(stack)) {
    const n = MutableList.shift(stack)!;

    if (fn(n)) {
      return n;
    }

    const rs = n.under?.toReversed();

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
      el.under = trie(el, [children] as any);
      return el;
    }
    case 'function': {
      return func(type, atts);
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
      el.under = trie(el, children);
      return el;
    }
    case 'function': {
      return func(type, atts);
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

const registerSourceFC = (type: FC.FC, atts: Props = {}): Source => {
  const element = jsxDEV(type, atts) as Func;

  if (element.props?.source) {
    const id = element.props.source;
    element[SrcId] = id;
    FC.overrideName(element.type, id);
    delete element.props.source;
    return element;
  }
  if (FC.isAnonymous(element.type)) {
    throw new Error('Anonymous function component cannot be a source element.');
  }
  element[SrcId] = FC.name(element.type);
  return element;
};

const registerSourceElement = (type: Element): Source => {
  if (isText(type)) {
    throw new Error('Root text element cannot be a source element.');
  }
  if (isRest(type)) {
    if (type.props?.source) {
      throw new Error('Root rest element must have a "source" prop to be a source element.');
    }
    type[SrcId] = type.props!.source;
    delete type.props!.source;
    return type;
  }
  if (!type.props?.source) {
    if (FC.isAnonymous(type.type)) {
      throw new Error('Anonymous function component cannot be a source element.');
    }
    type[SrcId] = FC.name(type.type);
    return type;
  }
  type[SrcId] = type.props!.source;
  FC.overrideName(type.type, type[SrcId]!);
  delete type.props!.source;
  return type;
};

export const registerSource = (type: Element | FC.FC, atts?: Props): Source => {
  if (isElem(type)) {
    return registerSourceElement(type);
  }
  return registerSourceFC(type, atts);
};

export const getSourceId = (n: Element | FC.FC): string | undefined => {
  if (typeof n === 'function') {
    return FC.name(n);
  }
  if (isFunc(n)) {
    return n[SrcId] ?? FC.name(n.type);
  }
  return n[SrcId];
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
  element.under = source.under!;
  return element;
};

export const createRootFromFC = (type: FC.FC, atts: Props): Func => {
  const props = rootProps(atts);
  const el = jsxDEV(type, props) as Func;
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

  export interface Handler {
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

type M<A, B, C> = {
  text: (n: Text) => A;
  rest: (n: Rest) => B;
  func: (n: Func) => C;
};

type AnyE = E.Effect<any, any, any>;

type ExtendsE<A, B, C> =
  [A, B, C] extends (infer Z)[]
  ? A | B | C extends AnyE
    ? E.Effect.AsEffect<A | B | C>
    : Z
  : never;

export const match = dual<
  <A, B, C>(m: M<A, B, C>) => (n: Element) => ExtendsE<A, B, C>,
  <A, B, C>(n: Element, m: M<A, B, C>) => ExtendsE<A, B, C>
>(
  2, <A, B, C>(n: Element, m: M<A, B, C>): ExtendsE<A, B, C> => {
    if (isText(n)) {
      return m.text(n) as ExtendsE<A, B, C>;
    }
    else if (isRest(n)) {
      return m.rest(n) as ExtendsE<A, B, C>;
    }
    return m.func(n) as ExtendsE<A, B, C>;
  },
);

export const equalTag = Equivalence.struct({
  [TypeId]: Equivalence.strict(),
});

export const equalType = Equivalence.struct({
  type: Equivalence.strict(),
});

export const equalProps = Equivalence.struct({
  props: Equal.equivalence(),
});

export const equalPropsChildren = Equivalence.struct({
  props: Equivalence.struct({
    children: Equivalence.strict(),
  }),
});

export type Predicate = P.Predicate<Element>;

export type Refinement<A extends Element> = P.Refinement<Element, A>;

export type Refined<A> = A extends Refinement<infer B> ? B : Element;

export const forEachChild = dual<
  (f: (n: Element, idx: number, p: Element) => void) => (n: Element) => Element,
  (n: Element, f: (n: Element, idx: number, p: Element) => void) => Element
>(
  2, (n: Element, f: (n: Element, idx: number, p: Element) => void) => {
    if (!n.under) {
      return n;
    }
    for (let i = 0; i < n.under.length; i++) {
      f(n.under[i], i, n);
    }
    return n;
  },
);

export const forEachChildRight = dual<
  (f: (n: Element, idx: number, p: Element) => void) => (n: Element) => Element,
  (n: Element, f: (n: Element, idx: number, p: Element) => void) => Element
>(
  2, (n: Element, f: (n: Element, idx: number, p: Element) => void) => {
    if (!n.under) {
      return n;
    }
    for (let i = n.under.length - 1; i >= 0; i--) {
      f(n.under[i], i, n);
    }
    return n;
  },
);
