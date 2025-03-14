import {EMPTY} from '#src/disreact/codec/constants/common.ts';
import type {Element} from '#src/disreact/model/entity/element.ts';
import {FC} from '#src/disreact/model/entity/fc.ts';
import {FiberNode} from '#src/disreact/model/hooks/fiber-node.ts';
import type {Root} from '#src/disreact/model/root.ts';



export const TAG = 'TaskElement';

export * as TaskElement from './task-element.ts';

export type TaskElement = Element.Meta & {
  _tag    : typeof TAG;
  type    : FC.FC;
  fiber   : FiberNode;
  props   : any;
  children: Element.Any[];
};

export const isTag = (self: Element.Any): self is TaskElement => self._tag === TAG;

export const makeId = (self: TaskElement, idx: number) => `${FC.getNaming(self.type)}:${idx}`;

export const isType = (type: any): type is FC.FC => FC.isFC(type);

export const make = (type: FC, props?: any): TaskElement => {
  const fc = FC.init(type);

  const element: TaskElement = {
    _tag    : TAG,
    type    : fc,
    id      : '',
    idx     : FC.getNaming(fc),
    props,
    fiber   : FiberNode.make(EMPTY),
    children: [],
  };

  element.fiber.element = element;

  return element;
};

export const linearize = (self: TaskElement) => {
  FiberNode.linearize(self.fiber);
};

export const circular = (self: TaskElement, root: Root) => {
  FiberNode.circularize(self.fiber, self, root.store);
  self.fiber.element         = self;
  root.store.fibers[self.id] = self.fiber;
  self.fiber.root            = root.store;
};

export const encode = (self: TaskElement) => self.children;

export const clone = (self: TaskElement): TaskElement => {
  const {props, fiber, type, children, ...rest} = self;

  const cloned    = structuredClone(rest) as TaskElement;
  cloned.props    = clonePropsDeep(props);
  cloned.type     = type;
  cloned.children = children;
  cloned.fiber    = FiberNode.clone(fiber);
  return cloned;
};

const clonePropsDeep = (props: any): any => {
  if (!props) {
    return {};
  }

  try {
    return structuredClone(props);
  }
  catch (e) {/**/}

  const acc = {} as any;

  for (const key of Object.keys(props)) {
    const original     = props[key];
    const originalType = typeof original;

    if (originalType === 'object') {
      if (!original) {
        acc[key] = null;
        continue;
      }
      if (Array.isArray(original)) {
        acc[key] = original.map((item) => clonePropsDeep(item));
        continue;
      }
      acc[key] = clonePropsDeep(original);
      continue;
    }

    acc[key] = original;
  }

  return props;
};

export const makeDEV = make;
