// import * as Globals from '#src/disreact/model/a/globals.ts';
import {setIds} from '#src/disreact/model/a/utils.ts';
import {Element} from '#src/disreact/model/entity/element';
import {Props} from '#src/disreact/model/entity/props.ts';
import {RestElement} from '#src/disreact/model/entity/rest-element.ts';
import {TaskElement} from '#src/disreact/model/entity/task-element.ts';
import {TextLeaf} from '#src/disreact/model/entity/text-leaf.ts';
import {FiberNode} from '#src/disreact/model/hooks/fiber-node.ts';
import {HookDispatch} from '#src/disreact/model/hooks/HookDispatch.ts';
import {renderTask} from '#src/disreact/model/lifecycle.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import * as Array from 'effect/Array';
import console from 'node:console';
import type {Root} from 'src/disreact/model/root.ts';



export const initialRender = (root: Root, node: Element.Any, parent?: Element): E.Effect<Element.Any> => {
  if (TextLeaf.is(node)) {
    return E.succeed(node);
  }
  if (RestElement.isTag(node)) {
    return pipe(
      parent ? setIds(node.children, parent) : node.children,
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


//   E.gen(function* () {
//   if (TextLeaf.is(node)) {
//     return node;
//   }
//
//   if (RestElement.isTag(node)) {
//     node.children = yield* E.all(node.children.map((child) => initialRender(root, child, node)));
//     return node;
//   }
//
//   console.log(root.id);
//   console.log(node.id);
//
//   root.store.fibers[node.id] = node.fiber;
//
//   node.children = yield* pipe(
//     effectRenderNode(root, node),
//     E.map((children) => children.map((c) => initialRender(root, c, node))),
//   );
//
//   return node;
// });



export const hydrateRoot = (root: Root, node: Element.Any, states: {[k: string]: FiberNode}): E.Effect<Element.Any> => {
  if (TextLeaf.is(node)) {
    return E.succeed(node);
  }
  if (RestElement.isTag(node)) {
    return pipe(
      setIds(node.children, node),
      Array.map(
        (child) => hydrateRoot(root, child, states),
      ),
      E.all,
      E.map(
        (children) => {
          node.children = children;
          return node;
        },
      ),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (states[node.id]) {
    node.fiber = states[node.id];
  }

  return pipe(
    effectRenderNode(root, node),
    E.flatMap(
      (children) => E.all(children.map((c) => hydrateRoot(root, c, states))),
    ),
    E.map(
      (children) => {
        node.children = children;
        return node;
      },
    ),
  );
};

// E.gen(function* () {
//   if (TextLeaf.is(node)) {
//     return root;
//   }
//   if (RestElement.isTag(node)) {
//     node.children = yield* E.all(.map((child) => hydrateRoot(root, child, states));
//   )
//     ;
//     return node;
//   }
//
//   const state = states[node.id];
//
//   if (state) {
//     node.fiber = state;
//   }
//
//   node.children = yield* E.all((yield* effectRenderNode(root, node)).map((child) => hydrateRoot(root, child, states)));
//   return node;
// });



export const rerenderRoot = (root: Root) => {
  if (TextLeaf.is(root.element)) {
    return E.succeed(root);
  }
  if (RestElement.isTag(root.element)) {
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

const renderNodes = (root: Root, parent: Element, cs: Element.Any[], rs: Element.Any[]): E.Effect<Element.Any[]> => E.gen(function* () {
  const length   = Math.max(cs.length, rs.length);
  const children = [];

  for (let i = 0; i < length; i++) {
    const c = cs.at(i);
    const r = rs.at(i);

    if (!c && !r) throw new Error();

    if (!c && r) {
      if (TaskElement.isTag(r)) {
        root.store.fibers[r.id] = r.fiber;
      }
      children.push(yield* initialRender(root, r, parent));
      continue;
    }

    if (c && !r) {
      if (TaskElement.isTag(c)) {
        delete root.store.fibers[c.id];
      }
      continue;
    }

    if (c && r) {
      if (!Element.isSame(c, r)) {
        if (TaskElement.isTag(c)) {
          delete root.store.fibers[c.id];
        }

        children.push(yield* initialRender(root, r, parent));
      }

      else if (TextLeaf.is(c)) {
        children.push(c);
      }

      else if (RestElement.isTag(c)) {
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

const effectRenderNode = (root: Root, node: Element.Any): E.Effect<Element.Any[]> => {
  if (TextLeaf.is(node)) {
    return E.succeed([]);
  }

  if (RestElement.isTag(node)) {
    return E.succeed(node.children);
  }

  return pipe(
    renderTask(root, node),
    HookDispatch.withMutex(node.fiber),
    E.map((cs) => {
      console.log(node);

      const children   = Array.ensure(cs);
      node.fiber.pc    = 0;
      node.fiber.saved = structuredClone(node.fiber.stack);
      node.fiber.rc++;
      return setIds(children, node);
    }),
    E.provide(HookDispatch.Default),
  ) as E.Effect<any>;
};


//   E.gen(function* () {
//   if (RestElement.isTag(node)) {
//     return node.children;
//   }
//
//   // Globals.mountFiber(node.id, node.fiber);
//   // Globals.setDispatch(node.fiber);
//
//   const children = yield* pipe(
//     renderTask(root, node),
//     HookDispatch.withMutex(node.fiber),
//     E.map((children) => Array.ensure(children)),
//   ) as E.Effect<any>;
//
//   const linked   = setIds(children, node);
//
//   // node.fiber       = Globals.readFiber(node.id);
//   node.fiber.saved = structuredClone(node.fiber.stack);
//   node.fiber.pc    = 0;
//   node.fiber.rc++;
//
//   return linked;
// }).pipe();
