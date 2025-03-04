/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {DTML} from '#src/disreact/codec/constants';
import * as All from '#src/disreact/codec/constants/all.ts';
import * as Props from '#src/disreact/codec/element/props.ts';
import * as FiberState from '#src/disreact/codec/fiber/fiber-node.ts';
import * as Globals from '#src/disreact/model/lifecycles/globals.ts';
import * as Lifecycles from '#src/disreact/model/lifecycles/utils.ts';
import {isSameNode, setIds} from '#src/disreact/model/lifecycles/utils.ts';
import {E} from '#src/internal/pure/effect.ts';
import * as FunctionElement from '../../codec/element/function-element.ts';
import type * as Element from '../../codec/element/index.ts';
import * as IntrinsicElement from '../../codec/element/intrinsic-element.ts';
import * as TextElement from '../../codec/element/text-element.ts';



export const initialRender = (node: Element.T, parent?: Element.T): E.Effect<Element.T, any, any> => E.gen(function* () {
  const base = Lifecycles.linkNodeToParent(node, parent);

  if (TextElement.is(base)) {
    return base;
  }

  if (IntrinsicElement.is(base)) {
    return {
      ...base,
      children: yield* E.all(node.children.map((child) => initialRender(child, base))),
    } as IntrinsicElement.T;
  }

  Globals.mountFiber(base.meta.full_id, base.state);

  const children = yield* effectRenderNode(base);

  return {
    ...base,
    children: yield* E.all(children.map((child: any) => initialRender(child, base))),
    render  : base.render,
    state   : base.state,
  } as FunctionElement.T;
});



export const hydrateRoot = (node: Element.T, states: {[k: string]: FiberState.T}): E.Effect<Element.T, any, any> => E.gen(function* () {
  if (TextElement.is(node)) {
    return node;
  }
  if (IntrinsicElement.is(node)) {
    node.children = yield* E.all(setIds(node.children, node).map((child) => hydrateRoot(child, states)));
    return node;
  }

  const state = states[node.meta.full_id];

  if (state) {
    node.state = state;
  }

  node.children = yield* E.all((yield* effectRenderNode(node)).map((child) => hydrateRoot(child, states)));
  return node;
});



export const rerenderRoot = (root: Element.T): E.Effect<Element.T, any, any> => E.gen(function* () {
  if (TextElement.is(root)) {
    return root;
  }
  if (IntrinsicElement.is(root)) {
    return root;
  }
  const current  = root.children;
  const rendered = yield* effectRenderNode(root);
  root.children  = yield* renderNodes(root, current, rendered);
  return root;
});

const renderNodes = (parent: Element.T, cs: Element.T[], rs: Element.T[]): E.Effect<Element.T[], any, any> => E.gen(function* () {
  const length   = Math.max(cs.length, rs.length);
  const children = [];

  for (let i = 0; i < length; i++) {
    const c = cs.at(i);
    const r = rs.at(i);

    if (!c && !r) throw new Error();

    if (!c && r) {
      Globals.mountFiber(r.meta.full_id);

      children.push(yield* initialRender(r, parent));

      continue;
    }

    if (c && !r) {
      Globals.dismountFiber(c.meta.full_id);

      continue;
    }

    if (c && r) {
      if (!isSameNode(c, r)) {
        Globals.dismountFiber(c.meta.full_id);

        children.push(yield* initialRender(r, parent));
      }

      else if (c._tag === All.TextElementTag) {
        children.push(c);
      }

      else if (c._tag === All.IntrinsicElementTag) {
        if (!Props.isEqual(c.props, r.props)) {
          c.props = r.props;
        }
        c.children = yield* renderNodes(c, c.children, r.children);
        children.push(c);
      }

      else if (Props.isEqual(c.props, r.props)) {
        if (FiberState.isSame(c.state)) {
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

const effectRenderNode = (node: Element.T): E.Effect<Element.T[], any, any> => E.gen(function* () {
  if (TextElement.is(node)) {
    return [];
  }
  if (IntrinsicElement.is(node)) {
    return node.children;
  }

  Globals.mountFiber(node.meta.full_id, node.state);
  Globals.setDispatch(node.state);

  const children = yield* FunctionElement.render(node);
  const linked   = setIds(children, node);

  node.state       = Globals.readFiber(node.meta.full_id);
  node.state.prior = structuredClone(node.state.stack);
  node.state.pc    = 0;
  node.state.rc++;

  if (children.some((child) => child._name === DTML.dialog || child._name === DTML.modal)) {
    node.meta.isModal = true;
  }
  if (children.some((child) => child._name === DTML.message)) {
    node.meta.isMessage = true;
    if (children.some((child) => child.props.ephemeral)) {
      node.meta.isEphemeral = true;
    }
  }

  return linked;
});
