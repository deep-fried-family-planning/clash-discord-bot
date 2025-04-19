import {Props} from '#src/disreact/model/elem/props.ts';
import type {Trigger} from '#src/disreact/model/elem/trigger.ts';
import {FC} from '#src/disreact/model/elem/fc.ts';
import {Fibril} from '#src/disreact/model/meta/fibril.ts';
import {E} from '#src/disreact/utils/re-exports.ts';

export * as Elem from '#src/disreact/model/elem/elem.ts';
export type Elem =
  | Task
  | Rest
  | Fragment
  | Value;

export interface Node {
  type   : any;
  id?    : string | undefined;
  ids?   : string | undefined;
  idn?   : string | undefined;
  idx?   : number | undefined;
  length?: number | undefined;
  fibril?: Fibril | undefined;
  props  : Props;
  nodes  : Elem[];
}

export const isNode = (self: any): self is Node => typeof self === 'object';

export type Child =
  | Task
  | Rest
  | Fragment
  | ValueType;

export type Children = Child | Child[];

export const isChild = (children: any): children is Child => !children.length;

export const connectChildren = (parent: Node, children: Children): Elem[] => {
  if (isValueType(children)) return [makeValue(children)];
  if (isChild(children)) return [connectChild(parent, children)];
  return connectNodes(parent, children);
};

export const connectNodes = (parent: Node, children: Child[]): Elem[] => {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    children[i] = isValueType(child)
      ? makeValue(child)
      : connectChild(parent, child, i);
  }
  return children as Elem[];
};

export const connectChild = (parent: Node, child: Node, idx: number = 0): Elem => {
  child.idx = idx;
  const child_id = `${child.idn ?? child.type ?? ''}:${idx}`;
  const parent_id = `${parent.idn ?? parent.type ?? ''}:${parent.idx}`;
  child.id = `${parent.id}:${child_id}`;
  child.ids = `${parent_id}:${child_id}`;
  return child;
};

export type TaskType<E = any, R = any> = (prop?: any) =>
  | Child
  | Promise<Child>
  | E.Effect<Child, E, R>;

export interface Task extends Node {
  type  : FC;
  fibril: Fibril;
}

export const isTaskType = (self: any): self is TaskType => typeof self === 'function';

export const isTask = (self: any): self is Task => typeof self === 'object' && typeof self.type === 'function';

export const isEqualTask = (a: Task, b: Task) => {
  if (a === b) return true;
  if (a.type !== b.type) return false;
  if (!Props.isEqual(a.props, b.props)) return false;
  if (a.nodes.length !== b.nodes.length) return false;
  return true;
};

export const makeTask = (type: any, props: any): Task => {
  const fc = FC.make(type);
  return {
    type  : fc,
    idn   : FC.getName(fc),
    props,
    nodes : [],
    fibril: Fibril.make(),
  };
};

export const cloneTask = (self: Task): Task => {
  const {type, props, nodes, fibril, ...rest} = self;
  const cloned = structuredClone(rest) as Task;
  cloned.type = type;
  cloned.fibril = Fibril.clone(fibril);
  cloned.props = Props.deepCloneTaskProps(props);
  cloned.nodes = nodes;
  return cloned;
};

export type RestType = string;

export interface Rest extends Node {
  type    : string;
  handler?: Trigger.Handler<any> | undefined;
}

export const isRestType = (self: any): self is RestType => typeof self === 'string';

export const isRest = (self: any): self is Rest => typeof self === 'object' && typeof self.type === 'string';

export const makeRest = (type: string, props: any, nodes: any[]): Rest =>
  ({
    type,
    props,
    nodes,
    handler: Props.getHandler(props),
  });

export const cloneRest = (self: Rest): Rest => {
  const {props, nodes, handler, ...rest} = self;
  const cloned = structuredClone(rest) as Rest;
  cloned.props = Props.cloneKnownProps(props);
  cloned.nodes = nodes;
  cloned.handler = handler;
  return cloned;
};

/**
 * Fragment
 */
export type FragmentType = undefined;

export const FragmentType = undefined;

export interface Fragment extends Node {
  type: FragmentType;
};

export const isFragmentType = (self: any): self is FragmentType => self === FragmentType;

export const isFragment = (self: any): self is Fragment => self.type === FragmentType;

export const makeFragment = (type: undefined, props: any): Fragment =>
  ({
    type,
    props,
    nodes: props.children,
  });

export const cloneFragment = (self: Fragment) => {
  const {props, nodes, ...rest} = self;
  const cloned = structuredClone(rest) as Fragment;
  cloned.props = Props.cloneKnownProps(props);
  cloned.nodes = nodes;
  return cloned;
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

export const isValueType = (type: any): type is ValueType =>
  !type ||
  typeof type !== 'object';

export type Value =
  | string
  | bigint
  | number
  | true;

export const isValue = (self: Elem): self is Value =>
  typeof self !== 'object' ||
  self === null;

export const makeValue = (type: any): Value => {
  return type;
};

export const cloneValue = (self: Value) => structuredClone(self) as Value;
