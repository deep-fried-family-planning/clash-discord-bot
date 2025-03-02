/* eslint-disable no-empty */
import * as IntrinsicElement from '#src/disreact/codec/dsx/element/intrinsic-element.ts';
import type * as DSX from '../../codec/dsx/index.ts';



export const invokeIntrinsicTarget = (root: DSX.Element.T, event: DSX.Event.T) => {
  return invokeTargetInner(root, event);
};



const invokeTargetInner = (node: DSX.Element.T, event: DSX.Event.T, original = node): DSX.Element.T => {
  if (!IntrinsicElement.is(node)) {
    for (const child of node.children) {
      try {
        return invokeTargetInner(child, event, original);
      }
      catch (_) {}
    }
  }

  if (node.props.custom_id && event.custom_id === node.props.custom_id) {
    const handler = node.props[event.type];

    if (!handler) {
      throw new Error(`No handler for custom_id ${event.custom_id}`);
    }

    handler(event);

    return original;
  }

  if (event.custom_id === node.meta.step_id) {
    const handler = node.props[event.type];

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

  throw new Error(`No node with id_step "${event.custom_id}" having a handler for type "${event.type}" was not found`);
};
