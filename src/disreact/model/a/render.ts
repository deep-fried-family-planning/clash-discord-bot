/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {DTML} from '#src/disreact/codec/constants/index.ts';
import * as All from '#src/disreact/codec/constants/all.ts';
import * as Props from '#src/disreact/model/entity/component/props.ts';
import * as FiberState from '#src/disreact/model/entity/fiber/fiber-node.ts';
import * as Globals from '#src/disreact/lifecycles/globals.ts';
import * as Lifecycles from '#src/disreact/lifecycles/utils.ts';
import {setIds} from '#src/disreact/lifecycles/utils.ts';
import {E} from '#src/internal/pure/effect.ts';
import * as FunctionElement from '#src/disreact/model/entity/element/task-element.ts';
import * as Element from 'src/disreact/codec/element/index.ts';
import * as IntrinsicElement from '#src/disreact/model/entity/element/rest-element.ts';
import * as TextElement from '#src/disreact/model/entity/element/text-element.ts';
import { FiberNode } from 'src/disreact/codec/element/index.ts';



export const initialRender = (node: Element.Element, parent?: Element.Element): E.Effect<Element.Element, any, any> => E.gen(function* () {
  const base = Lifecycles.linkNodeToParent(node, parent);

  if (TextElement.is(base)) {
    return base;
  }

  if (IntrinsicElement.is(base)) {
    return {
      ...base,
      children: yield* E.all(node.children.map((child) => initialRender(child, base))),
    } as IntrinsicElement.RestElement;
  }

  Globals.mountFiber(base.meta.full_id, base.fiber);

  const children = yield* effectRenderNode(base);

  return {
    ...base,
    children: yield* E.all(children.map((child: any) => initialRender(child, base))),
    type    : base.render,
    fiber   : base.fiber,
  } as FunctionElement.TaskElement;
});



export const hydrateRoot = (node: Element.Element, states: {[k: string]: FiberState.FiberNode}): E.Effect<Element.Element, any, any> => E.gen(function* () {
  if (TextElement.is(node)) {
    return node;
  }
  if (IntrinsicElement.is(node)) {
    node.children = yield* E.all(setIds(node.children, node).map((child) => hydrateRoot(child, states)));
    return node;
  }

  const state = states[node.meta.full_id];

  if (state) {
    node.fiber = state;
  }

  node.children = yield* E.all((yield* effectRenderNode(node)).map((child) => hydrateRoot(child, states)));
  return node;
});



export const rerenderRoot = (root: Element.Element): E.Effect<Element.Element, any, any> => E.gen(function* () {
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

const renderNodes = (parent: Element.Element, cs: Element.Element[], rs: Element.Element[]): E.Effect<Element.Element[], any, any> => E.gen(function* () {
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
      if (!Element.isSame(c, r)) {
        Globals.dismountFiber(c.meta.full_id);

        children.push(yield* initialRender(r, parent));
      }

      else if (TextElement.is(c)) {
        children.push(c);
      }

      else if (IntrinsicElement.is(c)) {
        if (!Props.isEqual(c.props, r.props)) {
          c.props = r.props;
        }
        c.children = yield* renderNodes(c, c.children, r.children);
        children.push(c);
      }

      else if (Props.isEqual(c.props, r.props)) {
        if (FiberState.isSame(c.fiber)) {
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

const effectRenderNode = (node: Element.Element): E.Effect<Element.Element[], any, any> => E.gen(function* () {
  if (TextElement.is(node)) {
    return [];
  }
  if (IntrinsicElement.is(node)) {
    return node.children;
  }

  Globals.mountFiber(node.meta.full_id, node.fiber);
  Globals.setDispatch(node.fiber);

  const children = yield* FunctionElement.renderEffect(node);
  const linked   = setIds(children, node);

  node.fiber       = Globals.readFiber(node.meta.full_id);
  node.fiber.saved = structuredClone(node.fiber.stack);
  node.fiber.pc    = 0;
  node.fiber.rc++;

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
