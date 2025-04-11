import {Keys} from '#src/disreact/codec/rest-elem/keys';
import {Fibril} from '#src/disreact/model/entity/fibril.ts';
import type {Trigger} from '#src/disreact/model/entity/trigger.ts';
import {E} from '#src/internal/pure/effect.ts';
import { Data, Differ} from 'effect';
import {isArray} from 'effect/Array';
import type {UnknownException} from 'effect/Cause';
import {isPromise} from 'effect/Predicate';
import {FC} from 'src/disreact/model/entity/fc.ts';

export const TypeId = Symbol('disreact/Elem');
export type TypeId = typeof TypeId;

export type Return = Elem | Elem[];

export * as Elem from '#src/disreact/model/entity/elem.ts';
export type Elem =
  | Rest
  | Task;

export type Any =
  | Elem
  | Prim;

export interface MetaProps {
  [TypeId]: TypeId;
  type    : any;
  id?     : string | undefined;
  ids?    : string | undefined;
  idn?    : string | undefined;
  idx?    : number | undefined;
  props   : any;
  nodes   : Any[];
}

export type Frag = undefined;

export const Frag = undefined;

export type Prim =
  | symbol
  | string
  | bigint
  | number
  | boolean
  | null
  | undefined;

export interface Rest extends MetaProps {
  type   : string;
  handler: Trigger.Handler<any>;
}

export interface Task extends MetaProps {
  type  : FC;
  fibril: Fibril;
}

export const isPrim = (self: unknown): self is Prim => {
  if (!self) return true;
  switch (typeof self) {
    case 'object':
    case 'function':
      return false;
  }
  return true;
};

export const isRest = (self: unknown): self is Rest => typeof self === 'object' && typeof (self as any).type === 'string';

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
  const {props, nodes, handler, ...rest} = self;

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

export const jsxTask = (type: any, props: any): Task => {
  const fc = FC.make(type);
  const task = {} as Task;
  task.idn = FC.getName(fc);
  task.type = fc;
  task.props = props;
  task.nodes = [] as Elem[];
  task.fibril = Fibril.make();
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
  const {props, fibril, type, nodes, id, idx} = self;
  const clonedProps = deepCloneTaskProps(props);
  const task = jsxTask(type, clonedProps);
  task.fibril = Fibril.cloneStrand(fibril);
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

export const render = (self: Task) => FC.render(self.type, self.props);

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

export const deepCloneElem = <A extends Any>(elem: A): A => {
  if (isPrim(elem)) {
    return structuredClone(elem) as A;
  }

  const cloned = cloneElem(elem);

  for (let i = 0; i < cloned.nodes.length; i++) {
    const node = cloned.nodes[i];
    cloned.nodes[i] = deepCloneElem(node);
  }

  return cloned as A;
};

export const connectChild = (parent: Elem, child: Elem, idx: number) => {
  child.idx = idx;

  const child_id = `${child.idn ?? child.type}:${idx}`;
  const parent_id = `${parent.idn ?? parent.type}:${parent.idx}`;

  child.id = `${parent.id}:${child_id}`;
  child.ids = `${parent_id}:${child_id}`;
};

export type Ops = Data.TaggedEnum<{
  Skip   : {};
  Add    : {node: Any};
  Delete : {node: Any; idx: number};
  Replace: {node: Any; idx: number; child: Any};
  Update : {node: Any; idx: number; child: Any};
  Render : {};
}>;

export const Ops = Data.taggedEnum<Ops>();

export const {diff, patch} = Differ.make({
  empty  : undefined,
  diff   : () => Ops.Skip(),
  combine: () => Ops.Skip(),
  patch  : () => Ops.Skip(),
});
