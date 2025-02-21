/* eslint-disable @typescript-eslint/no-unnecessary-condition,no-case-declarations */
import { DTML } from '#src/disreact/codec/constants';
import * as All from '#src/disreact/codec/constants/all.ts';
import * as Children from '#src/disreact/codec/entities/children.ts';
import type * as FunctionElement from '#src/disreact/codec/entities/function-element.ts';
import * as IntrinsicElement from '#src/disreact/codec/entities/intrinsic-element.ts';
import type * as NodeState from '#src/disreact/codec/entities/node-state.ts';
import * as TextElement from '#src/disreact/codec/entities/text-element.ts';
import * as Globals from '#src/disreact/model/globals/globals.ts';
import type {Pragma} from '#src/disreact/model/lifecycle.ts';
import {hasSameProps, hasSameState, isSameNode, setIds} from '#src/disreact/model/lifecycles/utils.ts';
import * as Lifecycles from '#src/disreact/model/lifecycles/utils.ts';
import {E} from '#src/internal/pure/effect.ts';



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
    Globals.mountNode(base.meta.full_id, (base as any).state);

    const children = yield* effectRenderNode(base);

    return {
      ...base,
      children: yield* E.all(children.map((child: any) => initialRender(child, base))),
      render  : node.render,
      state   : node.state,
    } as FunctionElement.Type;
  }
});



export const hydrateRoot = (node: Pragma, states: {[k: string]: NodeState.Type}): E.Effect<Pragma, any> => E.gen(function* () {
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



export const rerenderRoot = (root: Pragma): E.Effect<Pragma, any> => E.gen(function* () {
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

const renderNodes = (parent: Pragma, css: Pragma[], rss: Pragma[]): E.Effect<Pragma[], any> => E.gen(function* () {
  const length   = Math.max(css.length, rss.length);
  const children = [];

  for (let i = 0; i < length; i++) {
    const c = css.at(i);
    const r = rss.at(i);

    if (!c && !r) throw new Error();

    if (!c && r) {
      Globals.mountNode(r.meta.full_id);

      children.push(yield* initialRender(r, parent));

      continue;
    }

    if (c && !r) {
      Globals.dismountNode(c.meta.full_id);

      continue;
    }

    if (c && r) {
      if (!isSameNode(c, r)) {
        Globals.dismountNode(c.meta.full_id);

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

const effectRenderNode = (node: Pragma): E.Effect<Pragma[], any> => E.gen(function* () {
  if (TextElement.is(node)) {
    return [];
  }
  if (IntrinsicElement.is(node)) {
    return node.children;
  }

  Globals.mountNode(node.meta.full_id, node.state);
  Globals.setDispatch(node.state);

  const output = node.render(node.props);

  const children = E.isEffect(output)
    ? yield* (output as E.Effect<any, any>)
    : output;

  const normalized = Children.normalize(children);

  const linked = setIds(normalized, node);

  node.state       = Globals.readNode(node.meta.full_id);
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
