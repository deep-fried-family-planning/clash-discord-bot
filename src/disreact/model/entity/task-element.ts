import {EMPTY, ZERO} from '#src/disreact/codec/constants/common.ts';
import {FC } from '#src/disreact/model/component/fc.ts';
import {Element} from '#src/disreact/model/element/element.ts';
import {FiberNode} from '#src/disreact/model/hooks/fiber-node.ts';



export interface TaskElement<P = any> extends Element.Meta {
  _tag    : Element.Tag.TASK;
  type    : FC.Unknown;
  fiber   : FiberNode;
  props   : any;
  children: any[];
}

export namespace TaskElement {
  export type T<P = any> = TaskElement<P>;

  export const is = (type: Element.Any): type is TaskElement => type._tag === Element.Tag.TASK;

  export const make = (type: FC.FC, props?: any): TaskElement => {
    const fc = FC.init(type);

    const element: TaskElement = {
      _tag    : Element.Tag.TASK,
      type    : fc,
      id      : FC.getName(type),
      idx     : ZERO,
      step_id : EMPTY,
      full_id : EMPTY,
      fiber   : FiberNode.make(EMPTY),
      props,
      children: [],
    };

    element.fiber.element = element;

    return element;
  };

  export const clone = (self: TaskElement): TaskElement => {
    const {props, fiber, type, children, ...rest} = self;

    const cloned    = structuredClone(rest) as T;
    cloned.fiber    = FiberNode.clone(fiber);
    cloned.props    = cloneProps(props);
    cloned.type     = type;
    cloned.children = children;
    return cloned;
  };

  const cloneProps = (props: any): any => {
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
        if (original instanceof Array) {
          acc[key] = original.map((item) => cloneProps(item));
          continue;
        }
        acc[key] = cloneProps(original);
        continue;
      }

      acc[key] = original;
    }

    return props;
  };

  export const encode = (self: T) => {
    return self.children;
  };

  export const makeDEV = make;
}
