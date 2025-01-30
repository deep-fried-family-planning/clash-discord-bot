/* eslint-disable @typescript-eslint/no-unnecessary-condition,@typescript-eslint/no-empty-object-type,@typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment */
import {Tags} from '#src/disreact/enum/index.ts';
import type {TagTypes} from '#src/disreact/model/dsx/types.ts';
import {ElementNode, FunctionNode} from '#src/disreact/model/node.ts';



export const createIntrinsicElement = (type: string, props: any) => {
  if (!(type in Tags)) throw new Error(`Unknown tag type: ${type}`);
  return {type, props};
};



export const createElementSingle = (type: TagTypes, props: {} | {children: {}}) => {
  if (!props) return createElementMulti(type, {children: []});

  if ('children' in props) {
    switch (typeof props.children) {
      case 'undefined':
        throw new Error('children must not be undefined');

      case 'string':
        return createElementMulti(type, {...props, children: [new ElementNode(props.children, {})]});
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

  switch (typeof type) {
    case 'string': {
      const created = createIntrinsicElement(type, props);
      return new ElementNode(type, created.props);
    }

    case 'undefined':
      return props.children;

    case 'function': {
      const node = new FunctionNode(type, props);
      return node.render(props);
    }
  }
};

export const createRootElement = (type: TagTypes, props: {}) => {
  if (typeof type !== 'function') {
    throw new Error('type must be a function');
  }
  const node = new FunctionNode(type, props);

  node.mount();
  const output = node.render(props);
  node.dismount();

  return output;
};
