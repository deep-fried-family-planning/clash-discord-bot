/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import * as FC from '#src/disreact/model/entity/fc.ts';
import * as Props from '#src/disreact/model/entity/props.ts';
import * as Array from 'effect/Array';
import * as Data from 'effect/Data';
import type * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';
import * as F from 'effect/Function';
import * as GlobalValue from 'effect/GlobalValue';
import * as Hash from 'effect/Hash';



export const TypeId  = Symbol('disreact/element'),
             PropsId = Symbol('disreact/element/props'),
             NodesId = Symbol('disreact/element/nodes'),
             TrieId  = Symbol('disreact/element/trie'),
             RootId  = Symbol('disreact/element/up'),
             DownId  = Symbol('disreact/element/left'),
             HeadId  = Symbol('disreact/element/right'),
             TailId  = Symbol('disreact/element/down'),
             CompId  = Symbol('disreact/element/comp'),
             TEXT    = 1 as const,
             FRAG    = 2 as const,
             REST    = 2 as const,
             COMP    = 3 as const;

const DepsId = Symbol('disreact/element/deps');

interface Meta {
  [TypeId] : number;
  type?    : any;
  $d       : number;
  $i       : number;
  $p       : number;
  _n?      : string;
  _s?      : string;
  props?   : any;
  rs?      : El[];
  text?    : any;
  name?    : string;
  diff?    : any;
  diffs?   : any[];
  [DepsId]?: WeakSet<Node>;
};
export interface Text extends Meta {
  [TypeId]: typeof TEXT;
  text    : any;
}
export interface Rest extends Meta {
  [TypeId]: typeof REST;
  type    : string;
  handler?: Event.Handler | undefined;
}
export interface Comp extends Meta {
  [TypeId]: typeof COMP;
  type    : FC.Any;
}
export type El = | Text
                 | Rest
                 | Comp;
export type Node = | Rest
                   | Comp;

const ElementProto = {
  [Hash.symbol](this: El) {
    return Hash.structure(this);
  },
  [Equal.symbol](this: El, that: El) {
    if (!(TypeId in that)) {
      throw new Error();
    }
    const selfKeys = Object.keys(this) as (keyof El)[];
    const thatKeys = Object.keys(that) as (keyof El)[];
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

import * as Proto from '#src/disreact/model/entity/proto.ts';

export const isElem = (el: any): el is El => !!el && typeof el === 'object' && el[TypeId],
             isText = (el: any): el is Text => el[TypeId] === TEXT,
             isRest = (el: any): el is Rest => el[TypeId] === REST,
             isComp = (el: any): el is Comp => el[TypeId] === COMP;

const text = (text?: any): Text =>
  Proto.from<Text>(ElementProto, {
    [TypeId]: TEXT,
    text    : text,
  });

const rest = (type: string, atts: any): Rest => {
  const handler = Props.handler(atts);
  return Proto.from<Rest>(ElementProto, {
    [TypeId]: REST,
    type    : type,
    name    : type,
    props   : Props.make(atts),
    handler : handler,
  });
};

const comp = (type: FC.FC, atts: any): Comp => {
  const fc = FC.make(type);
  return Proto.from<Comp>(ElementProto, {
    [TypeId]: COMP,
    type    : fc,
    name    : FC.id(fc)!,
    props   : Props.make(atts),
  });
};

export const root = (type: FC.FC, atts: Props.Props): Comp => {
  const props = structuredClone(atts);
  const el = jsxDEV(type, props) as Comp;
  el.$d = 0;
  el.$i = 0;
  el.$p = 0;
  el._n = `${el.name}:${0}`;
  el._s = `${el.name}:${0}`;
  return el;
};

export const Fragment = undefined;

export const jsx = (type: any, atts: any): El => {
  if (type === Fragment) {
    return atts.children;
  }
  if (typeof type === 'string') {
    if (!atts.children) {
      return rest(type, atts);
    }
    const children = atts.children;
    delete atts.children;
    const el = rest(type, atts);
    el.rs = nodes(trie(el, children));
    return el;
  }
  if (typeof type === 'function') {
    return comp(type, atts);
  }
  throw new Error();
};

export const jsxs = (type: any, atts: any): El => {
  if (type === Fragment) {
    return atts.children;
  }
  if (typeof type === 'string') {
    const children = atts.children.flat();
    delete atts.children;
    const el = rest(type, atts);
    el.rs = nodes(trie(el, children));
    return el;
  }
  if (typeof type === 'function') {
    return comp(type, atts);
  }
  throw new Error();
};

export const jsxDEV = (type: any, atts: any): El => {
  if (Array.isArray(atts.children)) {
    return jsxs(type, atts);
  }
  return jsx(type, atts);
};

type NodesInner = El[];

export interface Nodes extends NodesInner {
  [NodesId]: typeof NodesId;
};

const NodesProto = Object.assign(Proto.array(), {
  [NodesId]: NodesId,
  [Hash.symbol](this: Nodes) {
    return Hash.array(this);
  },
  [Equal.symbol](this: Nodes, that: Nodes) {
    if (!(NodesId in that) || that[NodesId] !== NodesId) {
      throw new Error('tsk tsk');
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

const nodes = (ns: any[]): El[] => Proto.from(NodesProto, ns);

const parents = GlobalValue
  .globalValue(Symbol.for('disreact/el/parents'), () => new WeakMap<El, Node>());

type Count = {
  t: number;
  r: Record<string, number>;
  c: WeakMap<FC.FC, number>;
  p: number;
};

const emptyCount = (): Count =>
  ({
    t: 0,
    r: {},
    c: new WeakMap<FC.FC, number>(),
    p: 0,
  });

const connect = (p: Node, n: any, count: Count) => {
  if (!isElem(n)) {
    count.t++;
    return text(n);
  }
  n.$d = p.$d + 1;
  n.$p = count.p++;
  n.$i = count.t;
  if (isRest(n)) {
    n.$i = count.r[n.name!] ??= 0;
    n._s = `${p.name}:${p.$i}:${n.name}:${n.$i}`;
    n._n = `${p._n}:${n.name}:${n.$i}`;
    count.r[n.name!]++;
    return n;
  }
  // const name = FC.id(n.type);
  n.$i = count.r[n.name!] ??= 0;
  // n.$i = count.c.get(n.type) ?? 0;
  n._s = `${p.name}:${p.$i}:${n.name}:${n.$i}`;
  n._n = `${p._n}:${n.name}:${n.$i}`;
  // count.c.set(n.type, n.$i + 1);
  count.r[n.name!]++;
  return n;
};

export const trie = (p: Node, rs = p.rs): El[] => {
  const count = emptyCount(),
        cs    = nodes(Array.ensure(rs ?? []).flat()),
        ids   = new Set<string>();
  for (let i = 0; i < cs.length; i++) {
    cs[i] = connect(p, cs[i], count);
    if (ids.has(cs[i]._n!)) {
      throw new Error(`Duplicate trie id: ${cs[i]._n}`);
    }
    ids.add(cs[i]._n!);
  }
  return cs;
};

export const update = (a: El, b: El) => {
  if (isText(a) && isText(b)) {
    a.text = b.text;
  }
  else if (isRest(a) && isRest(b)) {
    a.props = Props.make(b.props);
  }
  else if (isComp(a) && isComp(b)) {
    a.props = Props.make(b.props);
  }
  throw new Error('tsk tsk');
};

export const replace = (a: El, b: El) => {
  const p = parents.get(a);
  if (!p || !p.rs || p.rs[b.$p] !== a) {
    throw new Error('tsk tsk');
  }
  p.rs![b.$p!] = b;
};

export const prepend = (p: El, n: El) => {
  p.rs!.unshift(n);
  return p;
};

export const append = (p: El, n: El) => {
  p.rs!.push(n);
  return p;
};

export const remove = (p: El, pos: number) => {
  p.rs!.splice(pos, 1);
  return p;
};

export const insert = (p: El, n: El, pos: number) => {
  p.rs!.splice(pos, 0, n);
  return p;
};

export const accept = (p: El, ns: El[]) => {
  if (p.rs) {
    throw new Error('tsk tsk');
  }
  return p;
};

type Matcher<A> = {
  text: (n: Text) => A;
  rest: (n: Rest) => A;
  comp: (n: Comp) => A;
};

export const match = F.dual<
  <A>(m: Matcher<A>) => (n: El) => A,
  <A>(n: El, m: Matcher<A>) => A
>(
  2,
  (n, m) => {
    if (isText(n)) {
      return m.text(n);
    }
    else if (isRest(n)) {
      return m.rest(n);
    }
    return m.comp(n);
  },
);

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
  Data.struct({
    id,
    data,
  });

interface Meta {
  root? : Node | undefined;
  down? : El | undefined;
  head? : El | undefined;
  tail? : El | undefined;
  state?: {};
}
