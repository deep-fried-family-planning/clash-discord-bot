/* eslint-disable no-case-declarations */
import {Critical, Impossible} from '#src/disreact/codec/debug.ts';
import {HookDispatch, type NodeHookState} from '#src/disreact/model/HookDispatch.ts';
import {E} from '#src/internal/pure/effect.ts';
import {Data, Equal} from 'effect';
import console from 'node:console';
import type * as FunctionElement from '../codec/entities/function-element.ts';
import type * as IntrinsicElement from '../codec/entities/intrinsic-element.ts';
import type * as NodeState from '../codec/entities/node-state.ts';
import type * as TextElement from '../codec/entities/text-element.ts';
import * as All from '../codec/schema/common/all.ts';
import {DTML} from '../codec/schema/common/index.ts';
import * as Lifecycles from './lifecycles/index.ts';


export type RenderFn = (props: any) => any;

export type Pragma =
  | TextElement.Type
  | IntrinsicElement.Type
  | FunctionElement.Type;



export const cloneTree = Lifecycles.cloneTree;



export const initialRender = (node: Pragma, parent?: Pragma): E.Effect<Pragma, any> => E.gen(function* () {
  const base = Lifecycles.linkNodeToParent(node, parent);

  switch (node._tag) {
  case All.TextElementTag:
    return base;

  case All.IntrinsicElementTag:
    return {
      ...base,
      children: yield* E.all(node.children.map((child) => initialRender(child, base))),
    } as IntrinsicElement.Type;

  case All.FunctionElementTag:
    const children = yield* effectRenderNode(node);

    return {
      ...base,
      children: yield* E.all(children.map((child: any) => initialRender(child, base))),
      render  : node.render,
      state   : node.state,
    } as FunctionElement.Type;
  }
});



export const dispatchEvent = (node: Pragma, event: any, original: Pragma = node): Pragma => {
  if ('props' in node) {
    console.log('props', event);
    if (node.meta.step_id === event.id && node.props[event.type]) {
      if (typeof node.props[event.type] === 'function') {
        node.props[event.type](event);
        return original;
      }
    }
  }

  if ('children' in node) {
    for (const child of node.children) {
      try {
        return dispatchEvent(child, event, original);
      }
      catch (_) {
        // do nothing
      }
    }
  }

  throw new Critical({why: `No node with id_step "${event.id}" having a handler for type "${event.type}" was not found`});
};



export const hydrateRoot = (node: Pragma, states: {[k: string]: NodeState.Type}): E.Effect<Pragma, any> => E.gen(function* () {
  if (node._tag === All.TextElementTag) {
    return node;
  }
  if (node._tag === All.IntrinsicElementTag) {
    node.children = yield* E.all(setIds(node.children, node).map((child) => hydrateRoot(child, states)));
    return node;
  }

  if (node.meta.full_id in states) {
    node.state       = states[node.meta.full_id];
    node.state.prior = structuredClone(node.state.stack);
  }

  node.children = yield* E.all((yield* effectRenderNode(node)).map((child) => hydrateRoot(child, states)));
  return node;
});



export const rerenderRoot = (root: Pragma): E.Effect<Pragma, any> => E.gen(function* () {
  if (root._tag === All.TextElementTag) {
    return root;
  }
  if (root._tag === All.IntrinsicElementTag) {
    return root;
  }
  const current  = root.children;
  const rendered = yield* effectRenderNode(root);
  root.children  = yield* renderNodes(root, current, rendered);
  return root;
});

const renderNodes = (parent: Pragma, css: Pragma[], rss: Pragma[]): E.Effect<Pragma[], any> => E.gen(function* () {
  const length   = Math.max(css.length, rss.length);
  const children = [];

  for (let i = 0; i < length; i++) {
    const c = css.at(i);
    const r = rss.at(i);

    if (!c && !r) {
      throw new Impossible({});
    }
    if (!c && r) {
      HookDispatch.__mount(r.meta.full_id);
      children.push(yield* initialRender(r, parent));
      continue;
    }
    if (c && !r) {
      HookDispatch.__dismount(c.meta.full_id);
      continue;
    }
    if (c && r) {
      if (!isSameNode(c, r)) {
        HookDispatch.__dismount(c.meta.full_id);
        children.push(yield* initialRender(r, parent));
      }
      else if (c._tag === All.TextElementTag) {
        children.push(c);
      }
      else if (c._tag === All.IntrinsicElementTag) {
        if (!hasSameProps(c, r)) {
          c.props = r.props;
        }
        c.children = yield* renderNodes(c, c.children, r.children);
        children.push(c);
      }
      else if (hasSameProps(c, r)) {
        if (hasSameState(c)) {
          c.children = yield* renderNodes(c, c.children, c.children);
          children.push(c);
        }
        else {
          const nextchildren = yield* effectRenderNode(c);
          c.children         = yield* renderNodes(c, c.children, nextchildren);
          children.push(c);
        }
      }
      else {
        const nextchildren = yield* effectRenderNode(c);
        c.children         = yield* renderNodes(c, c.children, nextchildren);
        children.push(c);
      }
    }
  }
  return children;
});

const renderFunctionNode = (node: FunctionElement.Type) => {
  HookDispatch.__prep(node.meta.full_id, node.state);

  const output = node.render(node.props) as any[];

  const children   = Array.isArray(output) ? output : [output] as any[];
  const rendered   = setIds(children, node);
  node.state       = HookDispatch.__get(node.meta.full_id);
  node.state.stack = structuredClone(node.state.stack);
  node.state.pc    = 0;
  node.state.rc++;

  if (children.some((child) => child.name === DTML.dialog || child.name === DTML.modal)) {
    node.meta.isModal = true;
  }
  if (children.some((child) => child.name === DTML.message)) {
    node.meta.isMessage = true;
    if (children.some((child) => child.props.ephemeral)) {
      node.meta.isEphemeral = true;
    }
  }

  return rendered;
};

const effectRenderNode = (node: Pragma): E.Effect<Pragma[], any> => E.gen(function* () {
  if (node._tag === All.TextElementTag) {
    return [];
  }
  if (node._tag === All.IntrinsicElementTag) {
    return node.children;
  }

  HookDispatch.__prep(node.meta.full_id, node.state);

  const output = node.render(node.props);

  const children = E.isEffect(output)
    ? yield* (output as E.Effect<any, any>)
    : output;

  const normalized = Array.isArray(children)
    ? children
    : [children] as any[];

  const linked = setIds(normalized, node);

  node.state       = HookDispatch.__get(node.meta.full_id);
  node.state.prior = structuredClone(node.state.stack);
  node.state.pc    = 0;
  node.state.rc++;

  if (normalized.some((child) => child.name === DTML.dialog || child.name === DTML.modal)) {
    node.meta.isModal = true;
  }
  if (normalized.some((child) => child.name === DTML.message)) {
    node.meta.isMessage = true;
    if (normalized.some((child) => child.props.ephemeral)) {
      node.meta.isEphemeral = true;
    }
  }

  return linked;
});



const isSameNode = <A extends Pragma, B extends Pragma>(a: A, b: B) => {
  console.debug('[isSameNode]', a.meta.step_id, b.meta.step_id);
  if (a._tag !== b._tag) return false;
  if (a._name !== b._name) return false;
  if (a.meta.id !== b.meta.id) return false;
  if (a._tag === All.TextElementTag) return a.value === (b as TextElement.Type).value;
  console.debug('[isSameNode]: true');
  return true;
};

const hasSameProps = (c: Pragma, r: Pragma) => {
  const cprops = Data.struct((c).props);
  const rprops = Data.struct((r).props);
  const equals = Equal.equals(cprops, rprops);
  console.debug('[hasSameProps]', cprops, rprops, equals);
  console.debug('[hasSameProps]', equals);
  return equals;
};

const hasSameState = (c: FunctionElement.Type) => {
  const connected = Data.array((c).state.stack.map(Data.struct));
  const last      = Data.array((c).state.prior.map(Data.struct));
  const equals    = Equal.equals(connected, last);
  console.debug('[hasSameState]', connected, last);
  console.debug('[hasSameState]', equals);
  return equals;
};



const setIds = (children: Pragma[], parent: Pragma) => {
  for (let i = 0; i < children.length; i++) {
    children[i].meta.idx = i;
    children[i]          = Lifecycles.linkNodeToParent(children[i], parent);
  }
  return children;
};



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
