import * as FC from '#src/disreact/model/entity/fc.ts';
import * as Props from '#src/disreact/model/entity/props.ts';
import * as Arr from 'effect/Array';
import * as Data from 'effect/Data';
import type * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';
import * as GlobalValue from 'effect/GlobalValue';
import * as Hash from 'effect/Hash';

export const ElemTypeId = Symbol.for('disreact/el'),
             NodesTypeId = Symbol.for('disreact/el/nodes');

export const TEXT = 'text' as const,
             REST = 'rest' as const,
             COMP = 'comp' as const;

export namespace El {
  export type Pr = | string
                   | number
                   | boolean
                   | null
                   | undefined
                   | bigint;
  type Meta = {
    [ElemTypeId]: typeof ElemTypeId;
    key?        : string;
    idn?        : string;
    ids?        : string;
    name        : string;
    idx         : number;
    pos         : number;
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

const ElProto: Equal.Equal = Object.assign(Object.create(Object.prototype), {
  [ElemTypeId]: ElemTypeId,
  [Hash.symbol]() {
    return Hash.structure(this);
  },
  [Equal.symbol](this: any, that: any) {
    if (!(ElemTypeId in that) || that[ElemTypeId] !== ElemTypeId) {
      throw new Error('tsk tsk');
    }
    const selfKeys = Object.keys(this);
    const thatKeys = Object.keys(that as object);
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
});

const make = <A extends El.El>(el: A): A => Object.setPrototypeOf(el, ElProto);

export const isElem = (e: Cs.Cs): e is El.El => !!e && typeof e === 'object' && ElemTypeId in e;

export const isText = (e: Cs.Cs): e is El.Text => !!e && typeof e === 'object' && !Arr.isArray(e) && e._tag === TEXT;

export const isRest = (e: Cs.Cs): e is El.Rest => !!e && typeof e === 'object' && !Arr.isArray(e) && e._tag === REST;

export const isComp = (e: Cs.Cs): e is El.Comp => !!e && typeof e === 'object' && !Arr.isArray(e) && e._tag === COMP;

export const text = (type?: any): El.Text =>
  make({
    [ElemTypeId]: ElemTypeId,
    _tag        : TEXT,
    name        : '',
    idx         : 0,
    pos         : 0,
    value       : type,
  });

export const rest = (type: string, props: Props.Props): El.Rest => {
  const handler = Props.extractHandler(props);
  const key = Props.extractKey(props);
  const children = props.children;
  if (children) {
    delete props.children;
  }
  return make({
    [ElemTypeId]: ElemTypeId,
    _tag        : REST,
    key         : key,
    type        : type,
    name        : type,
    pos         : 0,
    idx         : 0,
    idn         : `${type}:${0}`,
    props       : Props.make(props),
    nodes       : ns(children),
    handler     : handler,
  });
};

export const comp = (type: FC.FC, props: Props.Props): El.Comp => {
  const key = Props.extractKey(props);
  const fc = FC.make(type);
  return make({
    [ElemTypeId]: ElemTypeId,
    _tag        : COMP,
    key         : key,
    name        : FC.name(fc),
    pos         : 0,
    idx         : 0,
    type        : fc,
    idn         : `${FC.name(fc)}:${0}`,
    props       : Props.make(props),
    nodes       : ns(),
  });
};

const NsProto: Equal.Equal = Object.assign(Object.create(Array.prototype), {
  [NodesTypeId]: NodesTypeId,
  [Hash.symbol]() {
    return Hash.array(this as any);
  },
  [Equal.symbol](this: any, that: any) {
    if (!(NodesTypeId in that) || that[NodesTypeId] !== NodesTypeId) {
      throw new Error('tsk tsk');
    }
    if (!Arr.isArray(that) || this.length !== that.length) {
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

export const ns = (ns?: any[]): El.El[] =>
  Object.setPrototypeOf(
    ns ? Arr.ensure(ns) : Arr.empty(),
    NsProto,
  );

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

export const insertNode = (parent: El.Nd, nd: El.El) => {
  parent.nodes.splice(nd.pos, 0, nd);
};

export const removeNode = (parent: El.Nd, pos: number) => {
  parent.nodes.slice(pos, 1);
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
