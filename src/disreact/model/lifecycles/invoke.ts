/* eslint-disable no-empty */
import * as IntrinsicElement from '#src/disreact/codec/element/intrinsic-element.ts';
import * as Events from '#src/disreact/codec/routing/events.ts';
import type {Pragma} from '#src/disreact/model/lifecycle.ts';



export const invokeIntrinsicTarget = (root: Pragma, event: Events.Type) => {
  if (Events.isSynthesizeEvent(event))
    return root;

  return invokeTargetInner(root, event);
};



const invokeTargetInner = (node: Pragma, event: Events.NonSyntheticEvent, original: Pragma = node): Pragma => {
  if (!IntrinsicElement.is(node)) {
    for (const child of node.children) {
      try {
        return invokeTargetInner(child, event, original);
      }
      catch (_) {}
    }
  }

  if (node.props.custom_id && event.id === node.props.custom_id) {
    const handler = node.props[event.type];

    if (!handler) {
      throw new Error(`No handler for custom_id ${event.id}`);
    }

    handler(event);

    return original;
  }

  if (event.id === node.meta.step_id) {
    const handler = node.props[event.type];

    if (!handler) {
      throw new Error(`No handler for step_id ${event.id}`);
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

  throw new Error(`No node with id_step "${event.id}" having a handler for type "${event.type}" was not found`);
};
