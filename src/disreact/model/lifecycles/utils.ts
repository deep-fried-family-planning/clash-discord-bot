import * as Codec from '#src/disreact/codec/index.ts';
import type {Pragma} from '#src/disreact/model/lifecycle.ts';



export const deepClone = structuredClone;



export const linkNodeToParent = <T extends Pragma>(node: T, parent?: Pragma): T => {
  if (!parent) {
    node.meta.idx   = 0;
    node.meta.id      = `${node._name}:${node.meta.idx}`;
    node.meta.step_id = `${node._name}:${node.meta.idx}`;
    node.meta.full_id = `${node._name}:${node.meta.idx}`;
    node.meta.isRoot  = true;
  }
  else {
    node.meta.id      = `${node._name}:${node.meta.idx}`;
    node.meta.step_id = `${parent.meta.id}:${node.meta.id}`;
    node.meta.full_id = `${parent.meta.full_id}:${node.meta.id}`;
  }
  return node;
};



const intrinsicPropFunctionKeys = [
  Codec.Common.Reserved.onclick,
  Codec.Common.Reserved.onselect,
  Codec.Common.Reserved.ondeselect,
  Codec.Common.Reserved.onsubmit,
  Codec.Common.Reserved.oninvoke,
  Codec.Common.Reserved.onautocomplete,
];



export const removeReservedIntrinsicProps = (props: any) => {
  const {
          [Codec.Common.Reserved.onclick]       : _onclick,
          [Codec.Common.Reserved.onselect]      : _onselect,
          [Codec.Common.Reserved.ondeselect]    : _ondeselect,
          [Codec.Common.Reserved.onsubmit]      : _onsubmit,
          [Codec.Common.Reserved.oninvoke]      : _oninvoke,
          [Codec.Common.Reserved.onautocomplete]: _onautocomplete,
          [Codec.Common.Reserved.children]      : _children,
          [Codec.Common.Reserved.ref]           : _ref,
          [Codec.Common.Reserved.key]           : _key,
          ...rest
        } = props;

  return rest;
};



export const removeReservedFunctionProps = (props: any) => {
  const {
          [Codec.Common.Reserved.children]: _children,
          [Codec.Common.Reserved.ref]     : _ref,
          [Codec.Common.Reserved.key]     : _key,
          ...rest
        } = props;

  return rest;
};
