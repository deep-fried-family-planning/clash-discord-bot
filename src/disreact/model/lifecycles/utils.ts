import {Reserved} from '#src/disreact/codec/constants';
import type {Pragma} from '#src/disreact/model/lifecycle.ts';



export const deepClone = structuredClone;



export const linkNodeToParent = <T extends Pragma>(node: T, parent?: Pragma): T => {
  if (!parent) {
    node.meta.idx     = 0;
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
  Reserved.onclick,
  Reserved.onselect,
  Reserved.ondeselect,
  Reserved.onsubmit,
  Reserved.oninvoke,
  Reserved.onautocomplete,
];



export const removeReservedIntrinsicProps = (props: any) => {
  const {
          [Reserved.onclick]       : _onclick,
          [Reserved.onselect]      : _onselect,
          [Reserved.ondeselect]    : _ondeselect,
          [Reserved.onsubmit]      : _onsubmit,
          [Reserved.oninvoke]      : _oninvoke,
          [Reserved.onautocomplete]: _onautocomplete,
          [Reserved.children]      : _children,
          [Reserved.ref]           : _ref,
          [Reserved.key]           : _key,
          ...rest
        } = props;

  return rest;
};



export const removeReservedFunctionProps = (props: any) => {
  const {
          [Reserved.children]: _children,
          [Reserved.ref]     : _ref,
          [Reserved.key]     : _key,
          ...rest
        } = props;

  return rest;
};
