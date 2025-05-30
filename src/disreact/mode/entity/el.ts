import * as FC from '#src/disreact/mode/entity/fc.ts';
import * as Props from '#src/disreact/mode/entity/props.ts';
import * as Array from 'effect/Array';
import * as Data from 'effect/Data';
import type * as E from 'effect/Effect';
import * as GlobalValue from 'effect/GlobalValue';
import * as MutableList from 'effect/MutableList';

export const TypeId = Symbol.for('disreact/el');

export namespace El {
  export type Pr = | string
                   | number
                   | boolean
                   | null
                   | undefined
                   | bigint;
  type Meta = {
    [TypeId]: typeof TypeId;
    key?    : string;
    idn?    : string;
    ids?    : string;
    name    : string;
    idx     : number;
    pos     : number;
  };
  export interface Text extends Meta {
    _tag : typeof TEXT;
    type?: undefined;
    pos  : number;
    value: any;
  }
  export interface Rest extends Meta {
    _tag    : typeof REST;
    type    : string;
    handler?: Event.Handler | undefined;
    props   : Props.Props;
    nodes   : El[];
  }
  export interface Comp extends Meta {
    _tag : typeof COMP;
    type : FC.Any;
    props: Props.Props;
    nodes: El[];
  }
  export type Nd = | Rest
                   | Comp;
  export type El = | Text
                   | Nd;
}
export type Text = El.Pr;
export type Rest = El.Rest;
export type Comp = El.Comp;
export type Nd = El.Nd;
export type El = El.El;

export const TEXT = 'text' as const,
             REST = 'rest' as const,
             COMP = 'comp' as const;

export const isElem = (e: Cs.Cs): e is El.El => !!e && typeof e === 'object' && TypeId in e;

export const isText = (e: Cs.Cs): e is El.Text => !!e && typeof e === 'object' && !Array.isArray(e) && e._tag === TEXT;

export const isNode = (e: Cs.Cs): e is El.Nd => !!e && typeof e === 'object' && !Array.isArray(e) && 'type' in e;

export const isRest = (e: Cs.Cs): e is El.Rest => isNode(e) && e._tag === REST;

export const isComp = (e: Cs.Cs): e is El.Comp => isNode(e) && e._tag === COMP;

export const text = (type: any = {}): El.Text =>
  Data.struct({
    [TypeId]: TypeId,
    _tag    : TEXT,
    name    : '',
    idx     : 0,
    pos     : 0,
    value   : type,
  });

export const rest = (type: string, props: Props.Props = {}): El.Rest => {
  const handler = Props.extractHandler(props);
  const key = Props.extractKey(props);
  const children = props.children;
  if (children) {
    delete props.children;
  }
  return Data.struct({
    [TypeId]: TypeId,
    _tag    : REST,
    key     : key,
    type    : type,
    name    : type,
    pos     : 0,
    idx     : 0,
    idn     : `${type}:${0}`,
    props   : Props.make(props),
    nodes   : Data.array(children ? Array.ensure(children) : Array.empty()) as El.El[],
    handler : handler,
  });
};

export const comp = (type: FC.FC, props: Props.Props = {}): El.Comp => {
  const key = Props.extractKey(props);
  const fc = FC.make(type);
  return Data.struct({
    [TypeId]: TypeId,
    _tag    : COMP,
    key     : key,
    name    : FC.name(fc),
    pos     : 0,
    idx     : 0,
    type    : fc,
    idn     : `${FC.name(fc)}:${0}`,
    props   : Props.make(props),
    nodes   : Data.array(Array.empty()) as El.El[],
  });
};

export const clone = <A extends El.El>(el: A): A => {
  if (isText(el)) {
    return Data.struct(structuredClone(el)) as A;
  }
  if (isRest(el)) {
    return Data.struct({...el});
  }
  return Data.struct({...el});
};

export namespace Cs {
  export type Pr = | string
                   | number
                   | boolean
                   | null
                   | undefined
                   | bigint;
  export type Cs = | Pr
                   | El.El
                   | (Pr | El.El)[];
}
export type Cs = Cs.Cs;

const parents = GlobalValue.globalValue(
  Symbol.for('disreact/parents'),
  () => new WeakMap<El.El, El.Nd>(),
);

export const getParent = (child: El.El) => parents.get(child);

export const setParent = (child: El.El, parent: El.Nd) => parents.set(child, parent);

export const name = (nd: El.Nd) => isRest(nd) ? nd.type : nd.type[FC.NameId]!;

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

export namespace Stack {
  export type Stack = MutableList.MutableList<El.El>;
}
export type Stack = Stack.Stack;

export const stack = (el?: El.El): Stack.Stack => el ? MutableList.make(el) : MutableList.empty();

export const tail = (stack: Stack.Stack) => !!MutableList.tail(stack);

export const pop = (stack: Stack.Stack) => MutableList.pop(stack)!;

export const push = (stack: Stack.Stack, next: El.El) => {
  if (isText(next)) {
    return;
  }
  for (let i = 0; i < next.nodes.length; i++) {
    const node = next.nodes[i];
    if (isText(node)) {
      continue;
    }
    MutableList.append(stack, node);
  }
};

export const pushConnect = (stack: Stack.Stack, next: El.Nd) => {
  for (let i = 0; i < next.nodes.length; i++) {
    const node = next.nodes[i];
    if (isText(node)) {
      continue;
    }
    connect(next, node, i);
    MutableList.append(stack, node);
  }
};

export const regenNodes = (el: El.El) => {
  const regen = stack(el);
  while (tail(regen)) {
    const next = pop(regen);
    if (!isText(next)) {
      pushConnect(regen, next);
    }
  }
};

export const insertNode = (parent: El.Nd, nd: El.El) => {
  parent.nodes.splice(nd.pos, 0, nd);
  regenNodes(parent);
};

export const removeNode = (parent: El.Nd, pos: number) => {
  parent.nodes.slice(pos, 1);
  regenNodes(parent);
};

export const prependNode = (parent: El.Nd, nd: El.Nd) => {
  parent.nodes.splice(0, 0, nd);
  regenNodes(parent);
};

export const appendNode = (el: El.Nd, nd: El.Nd) => {
  el.nodes.push(nd);
};

export namespace Event {
  export type Event = {
    id  : string;
    data: any;
  };
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
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
