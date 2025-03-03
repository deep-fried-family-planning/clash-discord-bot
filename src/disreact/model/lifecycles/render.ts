/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import * as Children from '#src/disreact/codec/component/children.ts';
import * as DSX from '#src/disreact/codec/dsx/index.ts';
import type * as FiberNode from '#src/disreact/codec/fiber/fiber-node.ts';
import * as Globals from '#src/disreact/model/lifecycles/globals.ts';
import * as Lifecycles from '#src/disreact/model/lifecycles/utils.ts';
import {hasSameProps, hasSameState, isSameNode, setIds} from '#src/disreact/model/lifecycles/utils.ts';
import {E} from '#src/internal/pure/effect.ts';
import {DTML} from 'src/disreact/codec/common';



export const initialRender = (node: DSX.Element.T, parent?: DSX.Element.T): E.Effect<DSX.Element.T, any> => E.gen(function* () {
  const base = Lifecycles.linkNodeToParent(node, parent);

  if (DSX.isText(node)) {
    return base;
  }

  if (DSX.isIntrinsic(node)) {
    return {
      ...base,
      children: yield* E.all(node.children.map((child) => initialRender(child, base))),
    };
  }

  Globals.mountFiberNode(base.meta.full_id, (base as DSX.Function.T).fiber);
  const children = yield* effectRenderNode(base);

  return {
    ...base,
    children: yield* E.all(children.map((child: any) => initialRender(child, base))),
    render  : node.render,
    state   : node.fiber,
  };
});



export const hydrateRoot = (node: DSX.Element.T, states: {[k: string]: FiberNode.T}): E.Effect<DSX.Element.T, any> => E.gen(function* () {
  if (DSX.isText(node)) {
    return node;
  }
  if (DSX.isIntrinsic(node)) {
    node.children = yield* E.all(setIds(node.children, node).map((child) => hydrateRoot(child, states)));
    return node;
  }

  const state = states[node.meta.full_id];

  if (state) {
    node.fiber       = state;
    node.fiber.prior = structuredClone(node.fiber.stack);
  }

  node.children = yield* E.all((yield* effectRenderNode(node)).map((child) => hydrateRoot(child, states)));
  return node;
});



export const rerenderRoot = (root: DSX.Element.T): E.Effect<DSX.Element.T, any> => E.gen(function* () {
  if (DSX.isText(root)) {
    return root;
  }
  if (DSX.isFunction(root)) {
    return root;
  }
  const current  = root.children;
  const rendered = yield* effectRenderNode(root);
  root.children  = yield* renderNodes(root, current, rendered);
  return root;
});

const renderNodes = (parent: DSX.Element.T, css: DSX.Element.T[], rss: DSX.Element.T[]): E.Effect<DSX.Element.T[], any> => E.gen(function* () {
  const length   = Math.max(css.length, rss.length);
  const children = [];

  for (let i = 0; i < length; i++) {
    const c = css.at(i);
    const r = rss.at(i);

    if (!c && !r) throw new Error();

    if (!c && r) {
      Globals.mountFiberNode(r.meta.full_id);

      children.push(yield* initialRender(r, parent));

      continue;
    }

    if (c && !r) {
      Globals.dismountFiberNode(c.meta.full_id);

      continue;
    }

    if (c && r) {
      if (!isSameNode(c, r)) {
        Globals.dismountFiberNode(c.meta.full_id);

        children.push(yield* initialRender(r, parent));
      }

      else if (DSX.isText(c)) {
        children.push(c);
      }

      else if (DSX.isIntrinsic(c)) {
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

const effectRenderNode = (node: DSX.Element.T): E.Effect<DSX.Element.T[], any> => E.gen(function* () {
  if (DSX.isText(node)) {
    return [];
  }
  if (DSX.isIntrinsic(node)) {
    return node.children;
  }

  Globals.mountFiberNode(node.meta.full_id, node.fiber);
  Globals.setDispatch(node.fiber);

  const output = node.render(node.props);

  const children = E.isEffect(output)
    ? yield* (output as E.Effect<any, any>)
    : output;

  const normalized = Children.normalize(children);

  const linked = setIds(normalized, node);

  node.fiber       = Globals.getFiberNode(node.meta.full_id);
  node.fiber.prior = structuredClone(node.fiber.stack);
  node.fiber.pc    = 0;
  node.fiber.rc++;

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
