import type {Elem} from '#src/disreact/model/entity/element.ts';
import {RestElement} from '#src/disreact/model/entity/element-rest.ts';
import type * as Event from 'src/disreact/codec/element/event.ts';
import { LeafElem } from './entity/leaf';



export const invokeIntrinsicTarget = (root: Elem, event: Event.T) => {
  return invokeTargetInner(root, event);
};

const invokeTargetInner = (node: Elem, event: Event.T, original: Elem = node): Elem => {
  if (LeafElem.is(node)) {
    throw new Error();
  }

  if (!RestElement.isTag(node) && node.children) {
    for (const child of node.children) {
      try {
        return invokeTargetInner(child, event, original);
      }
      catch (_) {/**/}
    }
  }

  if (node.props?.custom_id && event.custom_id === node.props?.custom_id) {
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

  if (node.children) {
    for (const child of node.children) {
      try {
        return invokeTargetInner(child, event, original);
      }
      catch (_) {/**/}
    }
  }

  throw new Error(`No node with id_step "${event.custom_id}" having a handler for type "${event.prop}" was not found`);
};
