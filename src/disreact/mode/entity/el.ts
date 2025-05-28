/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import * as FC from '#src/disreact/mode/entity/fc.ts';
import * as Props from '#src/disreact/mode/entity/props.ts';
import * as Array from 'effect/Array';
import * as Data from 'effect/Data';
import type * as E from 'effect/Effect';
import * as MutableList from 'effect/MutableList';

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
  Data.struct({
    id,
    data,
  });

export declare namespace El {
  export type Pr = | string
                   | number
                   | boolean
                   | null
                   | undefined
                   | bigint;
  export interface Text {
    _tag : 'Text';
    pos  : number;
    value: Pr;
  }
  type Meta = {
    key? : string;
    idn? : string;
    ids? : string;
    idx? : number;
    pos? : number;
    props: Props.Props;
    nodes: El[];
  };
  export interface Rest extends Meta {
    _tag    : 'Rest';
    type    : string;
    handler?: Event.Handler | undefined;
  }
  export interface Component extends Meta {
    _tag: 'Component';
    type: FC.Any;
  }
  export type Nd = | Rest
                   | Component;
  export type El = | Text
                   | Nd;
  export type Cs = | Pr
                   | El
                   | (El | Pr)[];
}
export type Text = El.Pr;
export type Rest = El.Rest;
export type Comp = El.Component;
export type Nd = El.Nd;
export type El = El.El;
export type Cs = El.Cs;

export const isEl = (e: unknown): e is El.El => !!e && typeof e === 'object' && '_tag' in e;
export const isText = (e: El.Cs): e is El.Text => !!e && typeof e === 'object' && !Array.isArray(e) && e._tag === 'Text';
export const isNode = (e: El.Cs): e is El.Nd => !!e && typeof e === 'object' && !Array.isArray(e);
export const isRest = (e: El.Cs): e is El.Rest => isNode(e) && e._tag === 'Rest';
export const isComponent = (e: El.Cs): e is El.Component => isNode(e) && e._tag === 'Component';

const emptyNodes = () => Data.array(Array.empty()) as El.El[];

export const text = (type: any, pos: number): El.Text => {
  return Data.struct({
    _tag : 'Text',
    pos  : pos,
    value: type,
  });
};

export const rest = (type: string, props: Props.Props): El.Rest => {
  const handler = Props.extractHandler(props);
  const key = Props.extractKey(props);
  const children = props.children;
  if (children) {
    delete props.children;
  }
  return Data.struct({
    _tag   : 'Rest',
    key    : key,
    type   : type,
    props  : Props.make(props),
    nodes  : Data.array(children ? Array.ensure(children) : Array.empty()) as El.El[],
    handler: handler,
  });
};

export const component = (type: FC.FC, props: Props.Props): El.Component => {
  const key = Props.extractKey(props);
  return Data.struct({
    _tag : 'Component',
    key  : key,
    type : FC.make(type),
    props: Props.make(props),
    nodes: emptyNodes(),
  });
};

export const name = (nd: El.Nd) => isRest(nd) ? nd.type : nd.type[FC.NameId]!;

export const normalize = (nd: El.Nd, rs: El.Cs = nd.nodes): El.El[] => {
  const pn = name(nd);
  const cs = Array.ensure(rs).flat();
  const is = {} as Record<string, number>;
  const fs = new WeakMap<FC.FC, number>();

  for (let i = 0; i < cs.length; i++) {
    const c = cs[i];
    if (!isEl(c)) {
      cs[i] = text(c, i);
      continue;
    }
    if (isText(c)) {
      continue;
    }
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

export const connect = (node: El.El, next: El.El, idx: number) => {
  if (node._tag === 'Text' || next._tag === 'Text') {
    return;
  }
  const pn = name(node);
  const cn = name(next);
  next.idn = `${node.idn}:${cn}:${idx}`;
  next.ids = `${pn}:${node.idx}:${cn}:${idx}`;
  next.idx = idx;
};

export const stack = (el?: El.El): MutableList.MutableList<El.El> => el ? MutableList.make(el) : MutableList.empty<El.Nd>();

export const check = (stack: MutableList.MutableList<El.El>) => !!MutableList.tail(stack);

export const pop = (stack: MutableList.MutableList<El.El>) => MutableList.pop(stack)!;

export const push = (stack: MutableList.MutableList<El.El>, next: El.Nd) => {
  for (let i = 0; i < next.nodes.length; i++) {
    const node = next.nodes[i];
    if (isText(node)) continue;
    MutableList.append(stack, node);
  }
};

export const pushConnect = (stack: MutableList.MutableList<El.El>, next: El.Nd) => {
  for (let i = 0; i < next.nodes.length; i++) {
    const node = next.nodes[i];
    if (isText(node)) continue;
    connect(next, node, i);
    MutableList.append(stack, node);
  }
};

export const regenNodes = (el: El.El) => {
  const regen = MutableList.make(el);
  while (check(regen)) {
    const next = pop(regen);
    if (!isText(next)) {
      pushConnect(regen, next);
    }
  }
};

export const insertNode = (el: El.Nd, nd: El.El, idx: number) => {
  el.nodes.splice(idx, 0, nd);
  regenNodes(el);
};

export const removeNode = (el: El.Nd, idx: number) => {
  const c = el.nodes[idx];
  el.nodes.slice(idx, 1);
  regenNodes(el);
};

export const prependNode = (el: El.Nd, nd: El.Nd) => {
  el.nodes.splice(0, 0, nd);
  regenNodes(el);
};

export const appendNode = (el: El.Nd, nd: El.Nd) => {
  el.nodes.push(nd);
};
