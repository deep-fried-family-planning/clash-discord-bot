import {Reserved} from '#src/disreact/codec/common/index.ts';
import * as DSX from '../../codec/dsx';
import * as Utils from './utils.ts';


export const cloneTree = (node: DSX.Element.T, parent?: DSX.Element.T) => {
  const base  = Utils.linkNodeToParent(node, parent);
  const clone = cloneNode(base);

  if (node.children.length) {
    clone.children = node.children.map((child) => cloneTree(child, clone));
  }

  return clone;
};



export const cloneNode = <T extends DSX.Element.T>(node: T): T => {
  if (DSX.isText(node)) {
    return Utils.deepClone(node);
  }

  if (DSX.isIntrinsic(node)) {
    const {props, children, ...rest} = node;

    return {
      ...Utils.deepClone(rest),
      children,
      props: cloneIntrinsicProps(props),
    } as T;
  }

  const {
          props,
          children,
          render,
          fiber,
          ...rest
        } = node;

  return {
    ...Utils.deepClone(rest),
    fiber: cloneFunctionNodeState(fiber),
    props: cloneFunctionNodeProps(props),
    children,
    render,
  } as T;
};



const intrinsicPropFunctionKeys = [
  Reserved.onclick,
  Reserved.onselect,
  Reserved.ondeselect,
  Reserved.onsubmit,
  Reserved.oninvoke,
  Reserved.onautocomplete,
];

export const cloneIntrinsicProps = (props: any) => {
  const shallow = Utils.removeReservedIntrinsicProps(props);
  const cloned  = Utils.deepClone(shallow);

  for (const fn of intrinsicPropFunctionKeys) {
    if (props[fn]) {
      cloned[fn] = props[fn];
    }
  }

  return cloned;
};



export const cloneFunctionNodeState = (state: any) => {
  if (!state) return state;

  const {
          queue: effects,
          component,
          ...rest
        } = state;

  return {
    ...Utils.deepClone(rest),
    queue: effects,
    component,
  };
};



export const cloneFunctionNodeProps = (props: any) => {
  if (!props) return props;

  try {
    return structuredClone(props);
  }
  catch (e) {/**/}

  const acc = {} as any;

  for (const key of Object.keys(props)) {
    const original = props[key];

    switch (typeof original) {
    case 'symbol':
      throw new Error('Symbols are not supported');

    case 'object':
      if (original === null) acc[key] = null;
      else if (original instanceof Array) acc[key] = original.map((item) => cloneFunctionNodeProps(item));
      else acc[key] = cloneFunctionNodeProps(original);
      break;

    default:
      acc[key] = original;
    }
  }

  return props;
};
