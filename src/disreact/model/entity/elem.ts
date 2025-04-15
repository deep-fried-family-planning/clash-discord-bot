import {Keys} from '#src/disreact/codec/rest-elem/keys.ts';
import {FC} from '#src/disreact/model/entity/fc.ts';
import {Fibril} from '#src/disreact/model/entity/fibril.ts';
import type {Rehydrant} from '#src/disreact/model/rehydrant.ts';
import type {Trigger} from '#src/disreact/model/entity/trigger.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import {Data} from 'effect';
import {Props} from '#src/disreact/model/entity/props.ts';

const HANDLER_KEYS = [
  Keys.onclick,
  Keys.onselect,
  Keys.onsubmit,
];

const RESERVED = [
  ...HANDLER_KEYS,
  Keys.children,
  Keys.handler,
];

export type Return = Elem | Elem[];

export interface MetaProps {
  type : any;
  id?  : string | undefined;
  ids? : string | undefined;
  idn? : string | undefined;
  idx? : number | undefined;
  props: any;
  nodes: Any[];
}

/**
 * Elem
 */
export * as Elem from '#src/disreact/model/entity/elem.ts';
export type Elem =
  | Rest
  | Task;

export type Any =
  | Elem
  | Value;

export const connectNodes = (parent: Elem, nodes: Any[]) => {
  for (let i = 0; i < nodes.length; i++) {
    const child = nodes[i];
    if (isValue(child)) {
      continue;
    }
    connectChild(parent, child, i);
  }
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
const empty = Ops.Skip() as Ops;
const combine = () => {throw new Error();};

export const isSame = (a: Elem, b: Elem) => {
  if (a === b) return true;
  if (isValue(a) && isValue(b)) return false;
  return a.type === b.type;
};

/**
 * Task
 */
export type TaskType = (prop?: any) => any;

export interface Task extends MetaProps {
  type  : FC;
  fibril: Fibril;
}

export const isTaskType = (self: any): self is TaskType => typeof self === 'function';

export const isTask = (self: unknown): self is Task => {
  switch (typeof self) {
    case 'object':
      return typeof (self as any).type === 'function';
  }
  return false;
};

export const makeTask = (type: any, props: any): Task => {
  const fc = FC.make(type);
  const task = {} as Task;
  task.idn = FC.getName(fc);
  task.type = fc;
  task.props = props;
  task.nodes = [] as Elem[];
  task.fibril = Fibril.make();
  return task;
};

export const cloneTask = (self: Task): Task => {
  const {props, fibril, type, nodes, id, idx} = self;
  const clonedProps = Props.deepCloneTaskProps(props);
  const task = makeTask(type, clonedProps);
  task.fibril = Fibril.clone(fibril);
  task.nodes = nodes;
  task.id = id;
  task.idx = idx;
  return task;
};

/**
 * Rest
 */
export type RestType = string;

export interface Rest extends MetaProps {
  type    : string;
  handler?: Trigger.Handler<any> | undefined;
}

export const isRestType = (self: any): self is RestType => typeof self === 'string';

export const isRest = (self: any): self is Rest =>
  typeof self === 'object' &&
  typeof self.type === 'string';

export const makeRest = (type: string, props: any, nodes: any[]): Rest => {
  return {
    type,
    props,
    nodes,
    handler: Props.getHandler(props),
  };
};

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

/**
 * Fragment
 */
export type FragmentType = undefined;

export const FragmentType = undefined;

export const isFragmentType = (self: any): self is FragmentType => self === undefined;

export const makeFragment = (type: undefined, props: any) => {
  return props.children;
};

/**
 * Value
 */
export type ValueType =
  | string
  | bigint
  | number
  | boolean
  | null
  | undefined
  | symbol;

export const isValueType = (self: any): self is ValueType => {
  if (typeof self === 'object') return false;
  if (typeof self === 'function') return false;
  return true;
};

export type Value =
  | string
  | bigint
  | number
  | boolean
  | null
  | undefined
  | symbol;

export const isValue = (self: unknown): self is Value => {
  if (!self) return true;
  if (typeof self === 'object') return false;
  if (typeof self === 'function') return false;
  return true;
};

export const makeValue = (value: any): Value => value;

export const cloneValue = (self: Value): Value => structuredClone(self);

/**
 * schema
 */
export type Encoded<A extends string = string, B = any> =
  | {
      _tag     : A;
      rehydrant: Rehydrant.Decoded;
      data     : B;
    }
  | null;

export const declareEncoded = <T extends string, A, I, R>(_tag: T, data: S.Schema<A, I, R>) =>
  S.Struct({
    _tag: S.Literal(_tag),
    data: data,
  });
