/* eslint-disable @typescript-eslint/no-unnecessary-condition,@typescript-eslint/no-empty-object-type,@typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-argument */
import {DisReactAbstractNode} from '#disreact/model/nodes/abstract-node.ts';
import {ElementNode} from '#disreact/model/nodes/element-node.ts';
import {FunctionNode} from '#disreact/model/nodes/function-node.ts';
import {ActionRowTag, ButtonTag, createActionRowElement, createButtonElement, createDialogElement, createEmbedElement, createMessageElement, createSelectMenuElement, createTextInputElement, DialogTag, EmbedTag, MessageTag, SelectMenuTag, TextTag} from '#src/disreact/dsx/intrinsic.ts';
import type {TagTypes} from '#src/disreact/dsx/types.ts';



export const createIntrinsicElement = (type: string, props: any) => {
  switch (type) {
    case ActionRowTag:
      return createActionRowElement(type, props);

    case ButtonTag:
      return createButtonElement(type, props);

    case DialogTag:
      return createDialogElement(type, props);

    case EmbedTag:
      return createEmbedElement(type, props);

    case MessageTag:
      return createMessageElement(type, props);

    case SelectMenuTag:
      return createSelectMenuElement(type, props);

    case TextTag:
      return createTextInputElement(type, props);

    default:
      throw new Error(`Unknown tag type: ${type}`);
  }
};



export const createElementSingle = (type: TagTypes, props: {} | {children: {}}) => {
  if (!props) {
    return createElementMulti(type, {children: []});
  }
  if ('children' in props) {
    switch (typeof props.children) {
      case 'undefined':
        throw new Error('children must not be undefined');
      case 'string':
        return new Error('children must not be a string');
    }
    if (props.children === null) {
      throw new Error('children must not be null');
    }
    return createElementMulti(type, {...props, children: [props.children]});
  }
  return createElementMulti(type, {...props, children: []});
};



export const createElementMulti = (type: TagTypes, inputProps: {children: {}[]}) => {
  const children = inputProps.children.flat();
  const props    = {...inputProps, children};



  if (type instanceof ElementNode) {
    console.log('type instanceof DisReactAbstractNode');
  }

  switch (typeof type) {
    case 'string':{
      const created = createIntrinsicElement(type, props);

      return new ElementNode(type, created.props);
    }

    case 'undefined':
      return props.children;

    case 'function': {
      const node = new FunctionNode(type, props);

      // node.mount();

      const output = node.render(props);

      return output;
    }
  }
};


export const createRootElement = (
  type: TagTypes,
  props: {},
) => {
  if (typeof type !== 'function') {
    throw new Error('type must be a function');
  }

  const node = new FunctionNode(type, props);

  node.mount();

  const output = node.render(props);

  node.dismount();

  return output;
};
