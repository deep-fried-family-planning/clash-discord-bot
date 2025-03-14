import type {Element} from '#src/disreact/model/entity/element.ts';
import {RestElement} from '#src/disreact/model/entity/rest-element.ts';
import type * as Event from '../../codec/element/event.ts';



export const invokeIntrinsicTarget = (root: Element, event: Event.T) => {
  return invokeTargetInner(root, event);
};

const invokeTargetInner = (node: Element, event: Event.T, original: Element = node): Element => {
  if (!RestElement.isTag(node)) {
    for (const child of node.children) {
      try {
        return invokeTargetInner(child, event, original);
      }
      catch (_) {/**/}
    }
  }

  if (node.props.custom_id && event.custom_id === node.props.custom_id) {
    const handler = node.props[event.prop];

    if (!handler) {
      throw new Error(`No handler for custom_id ${event.custom_id}`);
    }

    handler(event);

    return original;
  }

  if (event.custom_id === node.step_id) {
    const handler = node.props[event.prop];

    if (!handler) {
      throw new Error(`No handler for step_id ${event.custom_id}`);
    }

    handler(event);

    return original;
  }

  for (const child of node.children) {
    try {
      return invokeTargetInner(child, event, original);
    }
    catch (_) {/**/}
  }

  throw new Error(`No node with id_step "${event.custom_id}" having a handler for type "${event.prop}" was not found`);
};
