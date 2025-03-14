import {EMPTY} from '#src/disreact/codec/constants/common.ts';
import type {Elem} from '#src/disreact/model/element/element.ts';
import {FC} from '#src/disreact/model/entity/fc.ts';
import {FiberNode} from '#src/disreact/model/entity/fiber-node.ts';



export const TAG = 'TaskElem';

export * as TaskElem from '#src/disreact/model/element/task.ts';
export type TaskElem<P = any, A = any> = Elem.Meta & {
  _tag    : typeof TAG;
  type    : FC<P, A>;
  fiber   : FiberNode;
  props   : P;
  children: Elem[];
};

export const is = (self: Elem): self is TaskElem => self._tag === TAG;

export const make = (type: FC, props?: any): TaskElem => {
  const element: TaskElem = {
    _tag    : TAG,
    type    : FC.init(type),
    id      : '',
    idx     : '',
    step_id : '',
    props,
    fiber   : FiberNode.make(EMPTY),
    children: [],
  };

  element.fiber.element = element;

  return element;
};

export const clone = (self: TaskElem): TaskElem => {
  const {props, fiber, type, children, ...rest} = self;

  const cloned    = structuredClone(rest) as TaskElem;
  cloned.type     = type;
  cloned.props    = deepCloneProps(props);
  cloned.fiber    = FiberNode.clone(fiber);
  cloned.children = children;
  return cloned;
};

const deepCloneProps = (props: any): any => {
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
        acc[key] = original.map((item) => deepCloneProps(item));
        continue;
      }
      acc[key] = deepCloneProps(original);
      continue;
    }

    acc[key] = original;
  }

  return props;
};

export const encode = (self: TaskElem) => self.children;
