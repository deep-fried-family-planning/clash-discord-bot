import { Keys } from '#src/disreact/codec/rest-elem/keys';
import {E} from '#src/internal/pure/effect.ts';
import * as Array from 'effect/Array';
import type {UnknownException} from 'effect/Cause';
import {isPromise} from 'effect/Predicate';
import type { Trigger } from '#src/disreact/model/entity/trigger.ts';
import { FC } from 'src/disreact/model/entity/fc.ts';
import { Fibril } from 'src/disreact/model/entity/fibril.ts';

export * as Elem from '#src/disreact/model/entity/elem.ts';
export type Elem =
  | Rest
  | Task;

export type Any =
  | Elem
  | Prim;

export type Frag = undefined;

export const Frag = undefined;

export const isFrag = (self: unknown): self is Frag => self === undefined;

export type Prim =
  | symbol
  | string
  | bigint
  | number
  | boolean
  | null
  | undefined;

export const isPrim = (self: unknown): self is Prim => {
  if (!self) return true;
  switch (typeof self) {
    case 'object':
    case 'function':
      return false;
  }
  return true;
};

export const clonePrim = (self: Prim): Prim => structuredClone(self);

export interface MetaProps {
  type   : any;
  id?    : string | undefined;
  ids?   : string | undefined;
  idn?   : string | undefined;
  idx?   : number | undefined;
  parent?: Elem | undefined;
  props  : any;
  nodes  : Any[];
}

export interface Rest extends Elem.MetaProps {
  type   : string;
  handler: Trigger.Handler<any>;
}

export const isRest = (self: unknown): self is Rest => {
  switch (typeof self) {
    case 'object':
      return typeof (self as any).type === 'string';
  }
  return false;
};

const HANDLER_KEYS = [
  Keys.onclick,
  Keys.onselect,
  Keys.onsubmit,
];

export const makeRest = (type: string, props: any, nodes: any[]): Rest => {
  const rest = {
    type,
    props,
    nodes,
  } as Rest;

  for (let i = 0; i < HANDLER_KEYS.length; i++) {
    const hkey = HANDLER_KEYS[i];
    const handler = props[hkey];
    if (handler) {
      rest.handler = handler;
      delete props[hkey];
    }
  }

  return rest;
};

export const jsxRest = (type: string, props: any): Rest => {
  const child = props.children;
  delete props.children;
  return makeRest(type, props, child ? [child] : []);
};

export const jsxsRest = (type: string, props: any): Rest => {
  const nodes = props.children;
  delete props.children;
  return makeRest(type, props, nodes);
};

const RESERVED = [
  ...HANDLER_KEYS,
  Keys.children,
  Keys.handler,
];

export const cloneRest = (self: Rest): Rest => {
  const {props, nodes, handler, parent, ...rest} = self;

  const reserved = {} as any;

  for (const key of RESERVED) {
    const prop = props[key];
    if (prop) {
      reserved[key] = prop;
      delete props[key];
    }
  }

  const cloned = structuredClone(rest) as Rest;
  cloned.props = structuredClone(props);
  cloned.nodes = nodes;
  cloned.handler = handler;

  for (const key of Object.keys(reserved)) {
    cloned.props[key] = reserved[key];
    props[key] = reserved[key];
  }

  return cloned;
};


export interface Task extends Elem.MetaProps {
  type  : FC;
  strand: Fibril.Strand;
}

export const jsxTask = (type: any, props: any): Task => {
  const fc = FC.init(type);
  const task = {} as Task;
  task.idn = FC.getName(fc);
  task.type = fc;
  task.props = props;
  task.nodes = [] as Elem[];
  task.strand = Fibril.makeStrand();
  return task;
};

export const jsxsTask = (type: any, props: any): Task => {
  const init = jsxTask(type, props);
  return init;
};

export const isTask = (self: unknown): self is Task => {
  switch (typeof self) {
    case 'object':
      return typeof (self as any).type === 'function';
  }
  return false;
};

export const cloneTask = (self: Task): Task => {
  const {props, strand, type, nodes, id, idx} = self;
  const clonedProps = deepCloneTaskProps(props);
  const task = jsxTask(type, clonedProps);
  task.strand = Fibril.cloneStrand(strand);
  task.nodes = nodes;
  task.id = id;
  task.idx = idx;
  return task;
};

const deepCloneTaskProps = (props: any): any => {
  if (!props) {
    return props;
  }

  try {
    return structuredClone(props);
  }
  catch (e) {/**/}

  const acc = {} as any;

  for (const key of Object.keys(props)) {
    const original = props[key];
    const originalType = typeof original;

    if (originalType === 'object') {
      if (!original) {
        acc[key] = null;
        continue;
      }
      if (Array.isArray(original)) {
        acc[key] = original.map((item) => deepCloneTaskProps(item));
        continue;
      }
      acc[key] = deepCloneTaskProps(original);
      continue;
    }

    acc[key] = original;
  }

  return props;
};

export const renderSync = (self: Elem.Task): Elem.Any[] => {
  const children = self.type(self.props);

  return children
    ? Array.ensure(children)
    : [];
};

export const renderAsync = (self: Elem.Task): E.Effect<Elem.Any[], UnknownException> =>
  E.tryPromise(async () => {
    const children = await self.type(self.props);

    return children
      ? Array.ensure(children)
      : [];
  });

export const renderEffect = (self: Elem.Task): E.Effect<Elem.Any[]> =>
  E.map(
    self.type(self.props) as E.Effect<Elem.Any[]>,
    (cs) => {
      return cs
        ? Array.ensure(cs)
        : [];
    },
  );

export const renderUnknown = (self: Elem.Task): E.Effect<Elem.Any[], UnknownException> => {
  const children = self.type(self.props);

  if (isPromise(children)) {
    self.type[FC.RenderSymbol] = FC.ASYNC;

    return E.tryPromise(async () => {
      const childs = await children;
      return childs
        ? Array.ensure(childs as Elem.Any)
        : [];
    });
  }

  if (E.isEffect(children)) {
    self.type[FC.RenderSymbol] = FC.EFFECT;

    return E.map(
      children as E.Effect<Elem.Any[]>,
      (cs) => {
        return cs
          ? Array.ensure(cs)
          : [];
      },
    );
  }

  self.type[FC.RenderSymbol] = FC.SYNC;

  return E.succeed(
    children
      ? Array.ensure(children)
      : [],
  );
};


export const jsx = (type: any, props: any): Elem => {
  if (type === undefined) {
    return props.children;
  }

  switch (typeof type) {
    case 'string':
      return jsxRest(type, props);
    case 'function':
      return jsxTask(type, props);
    default:
      throw new Error();
  }
};

export const jsxs = (type: any, props: any): Elem => {
  props.children = props.children.flat();

  if (type === undefined) {
    return props.children;
  }

  switch (typeof type) {
    case 'string':
      return jsxsRest(type, props);
    case 'function':
      return jsxsTask(type, props);
    default:
      throw new Error();
  }
};

export const jsxDEV = (type: any, props: any): Elem => {
  if (!Array.isArray(props.children)) {
    return jsx(type, props);
  }
  return jsxs(type, props);
};

export const cloneElem = (self: Elem) => {
  if (isRest(self)) {
    return cloneRest(self);
  }

  return cloneTask(self);
};

export const deepCloneElem = <A extends Any>(self: A): A => {
  if (isPrim(self)) {
    return clonePrim(self) as A;
  }

  const cloned = cloneElem(self);

  for (let i = 0; i < cloned.nodes.length; i++) {
    const node = cloned.nodes[i];
    cloned.nodes[i] = deepCloneElem(node);
  }

  return cloned as A;
};

export const linearizeElem = <A extends Elem>(self: A): A => {
  if (isTask(self)) {
    delete self.strand.nexus;
    delete self.strand.elem;
  }

  for (let i = 0; i < self.nodes.length; i++) {
    const node = self.nodes[i];

    if (!isPrim(node)) {
      linearizeElem(node);
    }
  }

  return self;
};

export const connectChild = (parent: Elem, child: Elem, idx: number) => {
  child.parent = parent;
  child.idx = idx;

  const child_id = `${child.idn ?? child.type}:${idx}`;
  const parent_id = `${parent.idn ?? parent.type}:${parent.idx}`;

  child.id = `${parent.id}:${child_id}`;
  child.ids = `${parent_id}:${child_id}`;
};
