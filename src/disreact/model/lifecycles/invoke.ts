/* eslint-disable no-empty */
import type * as Element from '#src/disreact/codec/element/index.ts';
import * as IntrinsicElement from '#src/disreact/codec/element/intrinsic-element.ts';
import type {Event} from '../../codec/rest/index.ts';


export const invokeIntrinsicTarget = (root: Element.T, event: Event.T) => {
  return invokeTargetInner(root, event);
};

const invokeTargetInner = (node: Element.T, event: Event.T, original: Element.T = node): Element.T => {
  if (!IntrinsicElement.is(node)) {
    for (const child of node.children) {
      try {
        return invokeTargetInner(child, event, original);
      }
      catch (_) {}
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

  if (event.custom_id === node.meta.step_id) {
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
    catch (_) {}
  }

  throw new Error(`No node with id_step "${event.custom_id}" having a handler for type "${event.prop}" was not found`);
};
