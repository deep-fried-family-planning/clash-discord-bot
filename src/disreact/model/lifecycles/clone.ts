import {Reserved} from '#src/disreact/codec/constants/index.ts';
import type {Pragma} from '#src/disreact/model/lifecycle.ts';
import * as Element from '../../codec/element/index.ts';
import * as Utils from './utils.ts';



export const cloneTree = (node: Pragma, parent?: Pragma) => {
  const base  = Utils.linkNodeToParent(node, parent);
  const clone = Element.clone(base);

  if (clone.children.length) {
    clone.children = node.children.map((child) => cloneTree(child, clone));
  }

  return clone;
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
