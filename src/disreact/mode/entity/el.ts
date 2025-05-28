/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import * as FC from '#src/disreact/mode/entity/fc.ts';
import * as Props from '#src/disreact/mode/entity/props.ts';
import * as Array from 'effect/Array';
import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';
import {globalValue} from 'effect/GlobalValue';
import * as MutableList from 'effect/MutableList';
import * as P from 'effect/Predicate';

const ps = globalValue(Symbol.for('disreact/el/parents'), () => new WeakMap<El.Node, El.Node>());

export declare namespace El {
  export type Prim = | string
                     | number
                     | boolean
                     | null
                     | undefined
                     | bigint;
  type Meta = {
    key? : string;
    idn? : string;
    ids? : string;
    idx? : number;
    pos? : number;
    props: Props.Props;
    nds  : El[];
  };
  export type Text = {
    _tag : 'text';
    value: | string
           | number
           | boolean
           | null
           | undefined
           | bigint;
  };
  export type Rest = Meta & {
    _tag    : 'rest';
    type    : string;
    handler?: Event.Handler | undefined;
  };
  export type Comp = Meta & {
    _tag: 'comp';
    type: FC.Any;
  };
  export type Ve = {pr: Prim};
  export type Node = | Rest
                     | Comp;
  export type El = | Text
                   | Node;
  export type Cs = | El
                   | El[];
  export type St = MutableList.MutableList<Node>;
  export type Kv = Record<string, Node>;
}
export type Text = El.Prim;
export type Node = El.Node;
export type Rest = El.Rest;
export type Comp = El.Comp;
export type El = El.El;
export type Cs = El.Cs;
export type St = El.St;
export type Kv = El.Kv;

export const isText = (e: El.Cs): e is El.Text => !!e && typeof e === 'object' && !Array.isArray(e) && e._tag === 'text';
export const isNode = (e: El.Cs): e is El.Node => !!e && typeof e === 'object' && !Array.isArray(e);
export const isRest = (e: El.Cs): e is El.Rest => isNode(e) && e._tag === 'rest';
export const isComp = (e: El.Cs): e is El.Comp => isNode(e) && e._tag === 'comp';

const emptyNodes = () => Data.array(Array.empty()) as El.El[];

export const text = (tag: any): El.Text =>
  Data.struct({
    _tag : 'text',
    value: tag,
  });

export const rest = (tag: string, props: Props.Props): El.Rest => {
  const handler = Props.extractHandler(props);
  const key = Props.extractKey(props);
  return Data.struct({
    _tag   : 'rest',
    key    : key,
    type   : tag,
    props  : Props.make(props),
    nds    : ensureChildren(props.children),
    handler: handler,
  });
};

export const comp = (tag: FC.FC, props: Props.Props): El.Comp => {
  const key = Props.extractKey(props);
  return Data.struct({
    _tag : 'comp',
    key  : key,
    type : FC.make(tag),
    props: Props.make(props),
    nds  : emptyNodes(),
  });
};

export const name = (nd: El.Node) => isRest(nd) ? nd.type : nd.type[FC.NameId]!;

export const normalize = (nd: El.Node, rs: El.Cs = nd.nds): El.El[] => {
  const pn = name(nd);
  const cs = Array.ensure(rs).flat();
  const is = {} as Record<string, number>;
  const fs = new WeakMap<FC.FC, number>();

  for (let i = 0; i < cs.length; i++) {
    const c = cs[i];
    if (isText(c)) {
      continue;
    }
    ps.set(c, nd);
    c.pos = i;
    if (isRest(c)) {
      const idx = is[c.type] ??= 0;
      c.idn = `${nd.idn}:${c.type}:${idx}`;
      c.ids = `${pn}:${nd.idx}:${c.type}:${idx}`;
      c.idx = idx;
      is[c.type]++;
    }
    else {
      const cname = FC.name(c.type);
      const idx = fs.get(c.type) ?? 0;
      c.idn = `${nd.idn}:${cname}:${idx}`;
      c.ids = `${pn}:${nd.idx}:${cname}:${idx}`;
      c.idx = idx;
      fs.set(c.type, idx + 1);
    }
  }
  return Data.array(cs) as El.El[];
};

export const connect = (node: El.Node, next: El.Node, idx: number) => {
  const pn = name(node);
  const cn = name(next);
  next.idn = `${node.idn}:${cn}:${idx}`;
  next.ids = `${pn}:${node.idx}:${cn}:${idx}`;
  next.idx = idx;
  ps.set(next, node);
  return next;
};

export const ensureChildren = (cs?: El.El | El.El[]): El.El[] => {
  if (!cs) {
    return emptyNodes();
  }
  if (Array.isArray(cs)) {
    return Data.array(cs.flat()) as El.El[];
  }
  return Data.array([cs]) as El.El[];
};

export const stack = (el?: El.Node): El.St => el ? MutableList.make(el) : MutableList.empty<El.Node>();

export const check = (stack: El.St) => !!MutableList.tail(stack);

export const pop = (stack: El.St) => MutableList.pop(stack)!;

export const push = (stack: El.St, next: El.Node) => {
  for (let i = 0; i < next.nds.length; i++) {
    const node = next.nds[i];
    if (isText(node)) continue;
    MutableList.append(stack, node);
  }
};

export const pushConnect = (stack: El.St, next: El.Node) => {
  for (let i = 0; i < next.nds.length; i++) {
    const node = next.nds[i];
    if (isText(node)) continue;
    connect(next, node, i);
    MutableList.append(stack, node);
  }
};

export const regenNodes = (el: El.Node) => {
  const regen = stack(el);
  while (check(regen)) {
    const next = pop(regen);
    pushConnect(regen, next);
  }
};

export const insertNode = (el: El.Node, nd: El.El, idx: number) => {
  if (isNode(nd)) {
    ps.set(nd, el);
  }
  el.nds.splice(idx, 0, nd);
  regenNodes(el);
};

export const removeNode = (el: El.Node, idx: number) => {
  const c = el.nds[idx];
  if (isNode(c)) {
    ps.delete(c);
  }
  el.nds.slice(idx, 1);
  regenNodes(el);
};

export const prependNode = (el: El.Node, nd: El.Node) => {
  ps.set(nd, el);
  el.nds.splice(0, 0, nd);
  regenNodes(el);
};

export const appendNode = (el: El.Node, nd: El.Node) => {
  ps.set(nd, el);
  el.nds.push(nd);
};

export declare namespace Event {
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

export const invoke = (el: El.Rest, event: Event.Event) => E.suspend(() => {
  const out = el.handler!(event);
  if (P.isPromise(out)) {
    return E.promise(async () => await out);
  }
  if (E.isEffect(out)) {
    return out as E.Effect<void>;
  }
  return E.void;
});

export const equalType = (a: El.Node, b: El.Node) => Equal.equals(a.type, b.type);
export const equalProps = (a: El.Node, b: El.Node) => Equal.equals(a.props, b.props);
export const parentOf = (el: El.Node) => ps.get(el);
