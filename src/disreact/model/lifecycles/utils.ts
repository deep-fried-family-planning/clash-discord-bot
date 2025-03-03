import * as DSX from '#src/disreact/codec/dsx/index.ts';
import * as FiberNode from '#src/disreact/codec/fiber/fiber-node.ts';
import {Reserved} from 'src/disreact/codec/common';



export const deepClone = structuredClone;

export const linkNodeToParent = <T extends DSX.Element.T>(node: T, parent?: DSX.Element.T): T => {
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

export const setIds = (children: DSX.Element.T[], parent: DSX.Element.T) => {
  for (let i = 0; i < children.length; i++) {
    children[i].meta.idx = i;
    children[i].meta.id  = `${parent._name}:${i}`;
    children[i]          = linkNodeToParent(children[i], parent);
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

export const isSameNode = <A extends DSX.Element.T, B extends DSX.Element.T>(a: A, b: B) => {
  if (a._tag !== b._tag) return false;
  if (a._name !== b._name) return false;
  if (a.meta.id !== b.meta.id) return false;
  if (DSX.Element.isText(a)) return a.value === (b as DSX.Element.Text.T).value;
  return true;
};

export const hasSameProps = (c: DSX.Element.T, r: DSX.Element.T) => DSX.Props.isEqual(c.props, r.props);

export const hasSameState = (c: DSX.Function.T) => FiberNode.isSameState(c.fiber);

export const collectStates = (node: DSX.Element.T, states: { [K in string]: FiberNode.T } = {}): typeof states => {
  if (DSX.Function.is(node)) {
    states[node.meta.full_id] = node.fiber;
  }

  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      collectStates(child, states);
    }
  }

  return states;
};

export const reduceToStacks = (hooks: { [K in string]: FiberNode.T }): { [K in string]: FiberNode.T['stack'] } => {
  return Object.fromEntries(
    Object.entries(hooks)
      .filter(([_, value]) => value.stack.length)
      .map(([key, value]) => [key, value.stack]),
  );
};
