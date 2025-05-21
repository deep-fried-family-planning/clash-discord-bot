/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import * as FC from '#src/disreact/mode/entity/fc.ts';
import * as Props from '#src/disreact/mode/entity/props.ts';
import * as Array from 'effect/Array';
import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as GlobalValue from 'effect/GlobalValue';
import * as MutableList from 'effect/MutableList';
import * as P from 'effect/Predicate';

export declare namespace El {
  export type Val = {
    type : false;
    props: any;
    nodes: El[];
  };
  export type Api = {
    idn?    : string;
    ids?    : string;
    idx?    : number;
    type    : string;
    props   : Props.Props;
    nodes   : El[];
    handler?: Event.Handler | undefined;
  };
  export type Fn = {
    idn? : string;
    ids? : string;
    idx? : number;
    type : FC.Any<any, any>;
    props: Props.Props;
    nodes: El[];
  };

  export type Any = Val | Nd;

  export type El = Any;

  export type Primitive = | string
                          | number
                          | boolean
                          | null
                          | undefined
                          | bigint;

  export type Nd = | Api
                   | Fn;

  export type Child = | Primitive
                      | Val
                      | Nd;

  export type Children = | Child
                         | Child[];

  export type Stack = MutableList.MutableList<Nd>;
}
export type El = El.El;
export type Val = El.Val;
export type Api = El.Api;
export type Fn = El.Fn;
export type Nd = El.Nd;
export type Any = El.Any;
export type Children = El.Children;
export type Stack = MutableList.MutableList<El.Nd>;

export const isChilds = (e: El.Children): e is El.Child[] => Array.isArray(e);
export const isPrimitive = (e: El.Children): e is El.Primitive => !e || typeof e !== 'object';
export const isNode = (e: El.Children): e is El.Nd => !!e && typeof e === 'object' && !Array.isArray(e);
export const isVal = (e: El.Children): e is El.Val => isNode(e) && !e.type;
export const isApi = (e: El.Children): e is El.Api => isNode(e) && typeof e.type === 'string';
export const isFn = (e: El.Children): e is El.Fn => isNode(e) && typeof e.type === 'function';

const emptyNodes = () => Data.array([] as El.El[]) as El.El[];

export const val = (value: any): El.Val => {
  return Data.struct({
    type : false,
    props: value,
    nodes: emptyNodes(),
  });
};

export const api = (tag: string, props: Props.Props): El.Api => {
  const handler = Props.extractHandler(props);
  return Data.struct({
    type : tag,
    props: Props.make(props),
    nodes: ensureChildren(props.children),
    handler,
  });
};

export const fn = (tag: any, props: Props.Props): El.Fn => {
  return Data.struct({
    type : FC.make(tag),
    props: Props.make(props),
    nodes: emptyNodes(),
  });
};

const getName = (el: El.Nd) => isApi(el) ? el.type : el.type[FC.NameId]!;

const parents = GlobalValue.globalValue(
  Symbol.for('disreact/el/parents'),
  () => new WeakMap<El.El, El.Nd>(),
);

export const normalize = (node: El.Nd, children: El.Children): El.El[] => {
  const pname = getName(node);
  const cs = Array.ensure(children).flat().filter((c) => !!c);
  const acc = [] as El.El[];

  for (let i = 0; i < cs.length; i++) {
    const c = cs[i];
    if (!c) {
      continue;
    }
    let next: El.El;
    if (isPrimitive(c)) {
      next = val(c);
    }
    else if (isVal(c)) {
      next = c;
    }
    else {
      next = c;
      const cname = getName(next);
      next.idn = `${node.idn}:${cname}:${i}`;
      next.ids = `${pname}:${node.idx}:${cname}:${i}`;
      next.idx = i;
    }
    parents.set(next, node);
    acc.push(next);
  }
  return Data.array(acc) as El.El[];
};

export const connect = (node: El.Nd, next: El.Nd, idx: number) => {
  const pname = getName(node);
  const cname = getName(next);
  next.idn = `${node.idn}:${cname}:${idx}`;
  next.ids = `${pname}:${node.idx}:${cname}:${idx}`;
  next.idx = idx;
  parents.set(next, node);
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

export const stack = (el?: El.Nd): El.Stack => el ? MutableList.make(el) : MutableList.empty<El.Nd>();

export const check = (stack: El.Stack) => !!MutableList.tail(stack);

export const pop = (stack: El.Stack) => MutableList.pop(stack)!;

export const push = (stack: El.Stack, next: El.Nd) => {
  for (let i = 0; i < next.nodes.length; i++) {
    const node = next.nodes[i];
    if (isVal(node)) continue;
    MutableList.append(stack, node);
  }
};

export const pushConnect = (stack: El.Stack, next: El.Nd) => {
  for (let i = 0; i < next.nodes.length; i++) {
    const node = next.nodes[i];
    if (isVal(node)) continue;
    connect(next, node, i);
    MutableList.append(stack, node);
  }
};

export const regenNodes = (el: El.Nd) => {
  const regen = stack(el);
  while (check(regen)) {
    const next = pop(regen);
    pushConnect(regen, next);
  }
};

export const insertNode = (el: El.Nd, nd: El.Nd, idx: number) => {
  parents.set(nd, el);
  el.nodes.splice(idx, 0, nd);
  regenNodes(el);
};

export const removeNode = (el: El.Nd, idx: number) => {
  const c = el.nodes[idx];
  parents.delete(c);
  el.nodes.slice(idx, 1);
  regenNodes(el);
};

export const prependNode = (el: El.Nd, nd: El.Nd) => {
  parents.set(nd, el);
  el.nodes.splice(0, 0, nd);
  regenNodes(el);
};

export const appendNode = (el: El.Nd, nd: El.Nd) => {
  parents.set(nd, el);
  el.nodes.push(nd);
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

export const invoke = (el: El.Api, event: Event.Event) => E.suspend(() => {
  const out = el.handler!(event);
  if (P.isPromise(out)) {
    return E.promise(async () => await out);
  }
  if (E.isEffect(out)) {
    return out as E.Effect<void>;
  }
  return E.void;
});
