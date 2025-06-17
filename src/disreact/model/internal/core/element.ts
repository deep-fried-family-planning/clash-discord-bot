import * as Deps from '#src/disreact/codec/old/deps.ts';
import * as FC from '#src/disreact/model/internal/infrastructure/fc.ts';
import * as Globals from '#src/disreact/model/internal/infrastructure/global.ts';
import * as Prototype from '#src/disreact/model/internal/infrastructure/prototype.ts';
import type * as Polymer from '#src/disreact/model/internal/polymer.ts';
import * as Array from 'effect/Array';
import type * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';
import {pipe} from 'effect/Function';
import * as Hash from 'effect/Hash';
import * as Inspectable from 'effect/Inspectable';
import * as MutableList from 'effect/MutableList';
import * as Pipeable from 'effect/Pipeable';
import console from 'node:console';
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

export const TypeId  = Symbol.for('disreact/element'),
             TEXT = 1,
             REST = 2,
             COMP = 3,
             PropsId = Symbol.for('disreact/props'),
             NodesId = Symbol.for('disreact/nodes'),
             SrcId   = Symbol.for('disreact/source');

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
  rs?     : Nodes;
  text?   : any;
  name?   : string;
};

export type Primitive =
  | null
  | undefined
  | boolean
  | number
  | string
  | symbol;

export interface Text extends Base {
  [TypeId]: typeof TEXT;
  text    : Primitive;
}

export interface Rest extends Base {
  [TypeId]: typeof REST;
  type    : string;
  handler?: Event.Handler | undefined;
}

export interface Comp extends Base {
  [TypeId]: typeof COMP;
  type    : FC.Known;
  polymer?: Polymer.Polymer;
}

export type Element =
  | Text
  | Rest
  | Comp;

export type Rendered = | Primitive
                       | Element
                       | (Primitive | Element)[];

export const isElement = (e: any): e is Element => typeof e === 'object' && e !== null && TypeId in e;

export const isRest = (e: any): e is Rest => e[TypeId] === REST;

export const isComp = (e: any): e is Comp => e[TypeId] === COMP;

export const isText = (e: any): e is Text => e[TypeId] === TEXT;

const RestProto = Prototype.declare<Rest>({
  [TypeId]: REST,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
});

const CompProto = Prototype.declare<Comp>({
  [TypeId]: COMP,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
});

const TextProto = Prototype.declare<Text>({
  [TypeId]: TEXT,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
});

export const rest = (type: string, atts: any): Rest => {
  const handler = propsHandler(atts);

  const self = Prototype.create(RestProto, {
    type   : type,
    name   : type,
    props  : props(atts),
    handler: handler,
  });

  return self;
};

export const comp = (type: FC.FC, atts: any): Comp => {
  const fc = FC.register(type);

  const self = Prototype.create(CompProto, {
    [SrcId]: FC.name(fc),
    type   : fc,
    name   : FC.name(fc),
  });
  self.props = props(atts, self);

  return self;
};

export const text = (text?: Primitive): Text => {
  const self = Prototype.create(TextProto, {
    text: text,
  });

  return self;
};

export namespace Props {
  export type Obj = { [K in string]: any };
  export type Arr = Props.Any[];
  export type Any = | Props.Obj
                    | Props.Arr;
}

export type Props = Props.Obj;

export const isProps = (u: unknown): u is Props => typeof u === 'object' && u !== null & PropsId in u;

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

export const props = (p: any, fn?: Comp): Props => {
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

import * as Equivalence from 'effect/Equivalence';

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



type NodesArray = Element[];

export interface Nodes extends NodesArray, Hash.Hash, Equal.Equal {
  [NodesId]: typeof NodesId;
};

const ElementsProto = Prototype.array<Nodes>({
  [NodesId]: NodesId,
  [Hash.symbol](this: Nodes) {
    return Hash.array(this);
  },
  [Equal.symbol](this: Nodes, that: Nodes) {
    if (that[NodesId] !== NodesId) {
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
  Globals.registerOrigin(n, p);
  return n;
};

export const trie = (p: Element, rs = p.rs): Nodes => {
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
  return cs as Nodes;
};

export const update = (a: Element, b: Element) => {
  if (isText(a) && isText(b)) {
    a.text = b.text;
  }
  else if (isRest(a) && isRest(b)) {
    a.props = props(b.props);
  }
  else if (isComp(a) && isComp(b)) {
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
      return comp(type, atts);
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
      return comp(type, atts);
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
  const element = jsxDEV(type, atts) as Comp;

  if (element.props?.source) {
    const id = element.props.source;
    element[SrcId] = id;
    element.type[FC.TypeId] = id;
    delete element.props.source;
    return element;
  }
  if (element.type[FC.TypeId] === FC.ANONYMOUS) {
    throw new Error('Anonymous function component cannot be a source element.');
  }
  element[SrcId] = element.type[FC.TypeId]!;
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
    if (type.type[FC.TypeId] === FC.ANONYMOUS) {
      throw new Error('Anonymous function component cannot be a source element.');
    }
    type[SrcId] = type.type[FC.TypeId]!;
    return type;
  }
  type[SrcId] = type.props!.source;
  type.type[FC.TypeId] = type[SrcId]!;
  delete type.props!.source;
  return type;
};

export const registerSource = (type: Element | FC.FC, atts?: Props): Source => {
  if (isElement(type)) {
    return registerSourceElement(type);
  }
  return registerSourceFC(type, atts);
};

export const getSourceId = (type: Element | FC.FC): string | undefined => {
  if (typeof type === 'function') {
    return (type as FC.Known)[FC.TypeId];
  }
  if (isComp(type)) {
    return type[SrcId] ?? type.type[FC.TypeId];
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

export const createRootFromFC = (type: FC.FC, atts: Props): Comp => {
  const props = rootProps(atts);
  const el = jsxDEV(type, props) as Comp;
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

export const lca = (es: Comp[]): Comp | undefined => {
  switch (es.length) {
    case 0: {
      return undefined;
    }
    case 1: {
      return es[0];
    }
  }
  return es[0] as Comp;
};
