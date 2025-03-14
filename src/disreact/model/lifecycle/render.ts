import {FC} from '#src/disreact/model/entity/fc.ts';
import {Props} from '#src/disreact/model/element/props.ts';
import {LeafElem} from '#src/disreact/model/element/leaf.ts';
import {RestElement} from '#src/disreact/model/element/rest.ts';
import {TaskElem} from '#src/disreact/model/element/task.ts';
import {Elem} from '#src/disreact/model/element/element.ts';
import {FiberNode} from '#src/disreact/model/entity/fiber-node.ts';
import type {Root} from '#src/disreact/model/entity/root.ts';
import {HookDispatch} from '#src/disreact/model/hooks/HookDispatch.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import * as Array from 'effect/Array';
import {isPromise} from 'effect/Predicate';



export const initialRender = (root: Root, node: Elem, parent?: Elem): E.Effect<Elem> => {
  if (LeafElem.is(node)) {
    return E.succeed(node);
  }
  if (RestElement.is(node)) {
    return pipe(
      parent ? Elem.setIds(node.children, node) : node.children,
      Array.map((child) => initialRender(root, child, node)),
      E.all,
      E.map((children) => {
        node.children = children;
        return node;
      }),
    );
  }

  root.store.fibers[node.id] = node.fiber;

  return pipe(
    effectRenderNode(root, node),
    E.flatMap((children) => E.all(children.map((c) => initialRender(root, c, node)))),
    E.map((children) => {
      node.children = children;
      return node;
    }),
  );
};

export const rerenderRoot = (root: Root) => {
  if (LeafElem.is(root.element)) {
    return E.succeed(root);
  }
  if (RestElement.is(root.element)) {
    return pipe(
      renderNodes(root, root.element, root.element.children, root.element.children),
      E.map(
        (children) => {
          root.element.children = children;
          return root;
        },
      ),
    );
  }
  return pipe(
    effectRenderNode(root, root.element),
    E.andThen(
      (children) => renderNodes(root, root.element, root.element.children, children),
    ),
    E.map(
      (children) => {
        root.element.children = children;
        return root;
      },
    ),
  );
};

const renderNodes = (root: Root, parent: Elem, cs: Elem[], rs: Elem[]): E.Effect<Elem[]> => E.gen(function* () {
  const length   = Math.max(cs.length, rs.length);
  const children = [];

  for (let i = 0; i < length; i++) {
    const c = cs.at(i);
    const r = rs.at(i);

    if (!c && !r) throw new Error();

    if (!c && r) {
      if (TaskElem.is(r)) {
        root.store.fibers[r.id] = r.fiber;
      }
      children.push(yield* initialRender(root, r, parent));
      continue;
    }

    if (c && !r) {
      if (TaskElem.is(c)) {
        delete root.store.fibers[c.id];
      }
      continue;
    }

    if (c && r) {
      if (!Elem.isSame(c, r)) {
        if (TaskElem.is(c)) {
          delete root.store.fibers[c.id];
        }

        children.push(yield* initialRender(root, r, parent));
      }

      else if (LeafElem.is(c)) {
        children.push(c);
      }

      else if (RestElement.is(c)) {
        if (!Props.isEqual(c.props, r.props)) {
          c.props = r.props;
        }
        c.children = yield* renderNodes(root, c, c.children, r.children);
        children.push(c);
      }

      else if (Props.isEqual(c.props, r.props)) {
        if (FiberNode.isSame(c.fiber)) {
          c.children = yield* renderNodes(root, c, c.children, c.children);
          children.push(c);
        }
        else {
          const nextchildren = yield* effectRenderNode(root, c);
          c.children         = yield* renderNodes(root, c, c.children, nextchildren);
          children.push(c);
        }
      }

      else {
        const nextchildren = yield* effectRenderNode(root, c);
        c.children         = yield* renderNodes(root, c, c.children, nextchildren);
        children.push(c);
      }
    }
  }
  return children;
});

export const effectRenderNode = (root: Root, node: Elem): E.Effect<Elem[]> => {
  if (LeafElem.is(node)) {
    return E.succeed([]);
  }

  if (RestElement.is(node)) {
    return E.succeed(node.children);
  }

  return pipe(
    renderTask(root, node),
    HookDispatch.withMutex(node.fiber),
    E.map((cs) => {
      const children   = Array.ensure(cs);
      node.fiber.pc    = 0;
      node.fiber.saved = structuredClone(node.fiber.stack);
      node.fiber.rc++;
      return Elem.setIds(children, node);
    }),
  ) as E.Effect<any>;
};

export const renderTask = (root: Root, element: TaskElem) => {
  element.fiber.pc      = 0;
  element.fiber.element = element;
  element.fiber.root    = root.store;
  delete root.store.fibers[element.id];
  root.store.fibers[element.id] = element.fiber;

  if (FC.isSync(element.type)) {
    return E.succeed(element.type(element.props));
  }
  if (FC.isAsync(element.type)) {
    return E.tryPromise(async () => await element.type(element.props)) as E.Effect<any>;
  }
  if (FC.isEffect(element.type)) {
    return element.type(element.props) as E.Effect<any>;
  }

  return E.suspend(() => {
    const children = element.type(element.props);

    if (isPromise(children)) {
      element.type[FC.RenderSymbol] = FC.ASYNC;

      return E.tryPromise(async () => await children) as E.Effect<any>;
    }

    if (E.isEffect(children)) {
      element.type[FC.RenderSymbol] = FC.EFFECT;

      return children as E.Effect<any>;
    }

    element.type[FC.RenderSymbol] = FC.SYNC;

    return E.succeed(children);
  });
};
