import type {FiberNode} from '#src/disreact/model/entity/fiber-node.ts';
import type {Root} from '#src/disreact/model/entity/root.ts';
import {effectRenderNode} from '#src/disreact/model/lifecycle/render.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import * as Array from 'effect/Array';
import {Elem} from '../element/element';
import {LeafElem} from '../element/leaf';
import {RestElement} from '../element/rest';



export const hydrateRoot = (root: Root, node: Elem, states: {[k: string]: FiberNode}): E.Effect<Elem> => {
  if (LeafElem.is(node)) {
    return E.succeed(node);
  }
  if (RestElement.is(node)) {
    return pipe(
      Elem.setIds(node.children, node),
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
