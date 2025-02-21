import type {Pragma} from '#src/disreact/model/lifecycle.ts';
import * as Codec from '../../codec/index.ts';
import * as Utils from './utils.ts';
import * as All from '../../codec/schema/common/all.ts';


export const cloneTree = (node: Pragma, parent?: Pragma) => {
  const base  = Utils.linkNodeToParent(node, parent);
  const clone = cloneNode(base);

  if (node.children.length) {
    clone.children = node.children.map((child) => cloneTree(child, clone));
  }

  return clone;
};



export const cloneNode = <T extends Pragma>(node: T): T => {
  if (node._tag === All.TextElementTag) {
    return Utils.deepClone(node);
  }

  if (node._tag === All.IntrinsicElementTag) {
    const {
            props,
            children,
            ...rest
          } = node;

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
          state,
          ...rest
        } = node;

  return {
    ...Utils.deepClone(rest),
    state: cloneFunctionNodeState(state),
    props: cloneFunctionNodeProps(props),
    children,
    render,
  } as T;
};



const intrinsicPropFunctionKeys = [
  Codec.Common.Reserved.onclick,
  Codec.Common.Reserved.onselect,
  Codec.Common.Reserved.ondeselect,
  Codec.Common.Reserved.onsubmit,
  Codec.Common.Reserved.oninvoke,
  Codec.Common.Reserved.onautocomplete,
];

export const cloneIntrinsicProps = (props: any) => {
  const shallow = Utils.removeReservedIntrinsicProps(props);
  const cloned = Utils.deepClone(shallow);

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
          ...rest
        } = state;

  return {
    ...Utils.deepClone(rest),
    queue: effects,
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
