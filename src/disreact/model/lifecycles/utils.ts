import {Reserved} from '#src/disreact/codec/constants';
import * as All from '#src/disreact/codec/constants/all.ts';
import type * as FunctionElement from '#src/disreact/codec/element/function-element.ts';
import type * as TextElement from '#src/disreact/codec/element/text-element.ts';
import {Props} from '#src/disreact/codec/entities';
import * as NodeState from '#src/disreact/codec/entities/node-state.ts';
import type {Pragma} from '#src/disreact/model/lifecycle.ts';
import * as Lifecycles from '#src/disreact/model/lifecycles/index.ts';



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

export const setIds = (children: Pragma[], parent: Pragma) => {
  for (let i = 0; i < children.length; i++) {
    children[i].meta.idx = i;
    children[i].meta.id  = `${parent._name}:${i}`;
    children[i]          = Lifecycles.linkNodeToParent(children[i], parent);
  }
  return children;
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



export const isSameNode = <A extends Pragma, B extends Pragma>(a: A, b: B) => {
  if (a._tag !== b._tag) return false;
  if (a._name !== b._name) return false;
  if (a.meta.id !== b.meta.id) return false;
  if (a._tag === All.TextElementTag) return a.value === (b as TextElement.Type).value;
  return true;
};

export const hasSameProps = (c: Pragma, r: Pragma) => Props.isEqual(c.props, r.props);

export const hasSameState = (c: FunctionElement.Type) => NodeState.isSameState(c.state);



export const collectStates = (node: Pragma, states: { [K in string]: NodeState.Type } = {}): typeof states => {
  if (node._tag === All.FunctionElementTag) {
    states[node.meta.full_id] = node.state;
  }

  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      collectStates(child, states);
    }
  }

  return states;
};

export const reduceToStacks = (hooks: { [K in string]: NodeState.Type }): { [K in string]: NodeState.Type['stack'] } => {
  return Object.fromEntries(
    Object.entries(hooks)
      .filter(([_, value]) => value.stack.length)
      .map(([key, value]) => [key, value.stack]),
  );
};
