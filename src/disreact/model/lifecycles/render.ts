/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {DTML} from '#src/disreact/codec/constants';
import * as All from '#src/disreact/codec/constants/all.ts';
import type * as FiberState from '#src/disreact/codec/entities/fiber-node.ts';
import type {Pragma} from '#src/disreact/model/lifecycle.ts';
import * as Globals from '#src/disreact/model/lifecycles/globals.ts';
import * as Lifecycles from '#src/disreact/model/lifecycles/utils.ts';
import {hasSameProps, hasSameState, isSameNode, setIds} from '#src/disreact/model/lifecycles/utils.ts';
import {E} from '#src/internal/pure/effect.ts';
import * as FunctionElement from '../../codec/element/function-element.ts';
import * as IntrinsicElement from '../../codec/element/intrinsic-element.ts';
import * as TextElement from '../../codec/element/text-element.ts';



export const initialRender = (node: Pragma, parent?: Pragma): E.Effect<Pragma, any, any> => E.gen(function* () {
  const base = Lifecycles.linkNodeToParent(node, parent);

  if (TextElement.is(node)) {
    return base;
  }

  if (IntrinsicElement.is(node)) {
    return {
      ...base,
      children: yield* E.all(node.children.map((child) => initialRender(child, base))),
    } as IntrinsicElement.IntrinsicElement;
  }

  Globals.mountFiber(base.meta.full_id, (base as FunctionElement.FunctionElement).state);

  const children = yield* effectRenderNode(base);

  return {
    ...base,
    children: yield* E.all(children.map((child: any) => initialRender(child, base))),
    render  : node.render,
    state   : node.state,
  } as FunctionElement.FunctionElement;
});



export const hydrateRoot = (node: Pragma, states: {[k: string]: FiberState.FiberNode}): E.Effect<Pragma, any, any> => E.gen(function* () {
  if (TextElement.is(node)) {
    return node;
  }
  if (IntrinsicElement.is(node)) {
    node.children = yield* E.all(setIds(node.children, node).map((child) => hydrateRoot(child, states)));
    return node;
  }

  const state = states[node.meta.full_id];

  if (state) {
    node.state       = state;
    node.state.prior = structuredClone(node.state.stack);
  }

  node.children = yield* E.all((yield* effectRenderNode(node)).map((child) => hydrateRoot(child, states)));
  return node;
});



export const rerenderRoot = (root: Pragma): E.Effect<Pragma, any, any> => E.gen(function* () {
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

const renderNodes = (parent: Pragma, css: Pragma[], rss: Pragma[]): E.Effect<Pragma[], any, any> => E.gen(function* () {
  const length   = Math.max(css.length, rss.length);
  const children = [];

  for (let i = 0; i < length; i++) {
    const c = css.at(i);
    const r = rss.at(i);

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

const effectRenderNode = (node: Pragma): E.Effect<Pragma[], any, any> => E.gen(function* () {
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
