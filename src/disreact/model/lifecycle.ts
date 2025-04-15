import {Elem} from '#src/disreact/model/entity/elem.ts';
import {Fibril} from '#src/disreact/model/entity/fibril.ts';
import {Props} from '#src/disreact/model/entity/props.ts';
import {Rehydrant} from '#src/disreact/model/entity/rehydrant.ts';
import type {Trigger} from '#src/disreact/model/entity/trigger.ts';
import {LifecycleUnits} from '#src/disreact/model/lifecycle-units.ts';
import {E, ML, pipe} from '#src/disreact/utils/re-exports.ts';
import {MutableList} from 'effect';

export * as Lifecycle from '#src/disreact/model/lifecycle.ts';
export type Lifecycle = never;

export const handleEvent = (root: Rehydrant, event: Trigger) => E.suspend(() => {
  const stack = ML.make<Elem>(root.elem);

  while (ML.tail(stack)) {
    const elem = ML.pop(stack)!;

    if (Elem.isRest(elem)) {
      if (elem.props.custom_id === event.id || elem.ids === event.id) {
        return LifecycleUnits.invoke(root, elem, event);
      }
    }

    for (let i = 0; i < elem.nodes.length; i++) {
      const node = elem.nodes[i];
      if (!Elem.isValue(node)) {
        ML.append(stack, elem.nodes[i]);
      }
    }
  }

  return E.fail(new Error('Event not handled'));
});

export const initialize = (root: Rehydrant) => initializeSubtree(root, root.elem);

const loopNodes = (stack: ML.MutableList<Elem>, root: Rehydrant, elem: Elem) => {
  for (let i = 0; i < elem.nodes.length; i++) {
    const node = elem.nodes[i];

    if (!Elem.isValue(node)) {
      Elem.connectChild(elem, node, i);
      Rehydrant.mount(root, node);
      ML.append(stack, node);
    }
  }
  return stack;
};

export const initializeSubtree = (root: Rehydrant, elem: Elem) => {
  let hasSentPartial = false;

  const stack = ML.make<Elem>(elem);

  return E.iterate(undefined as any, {
    while: () => !!ML.tail(stack),
    body : () => {
      const elem = ML.pop(stack)!;

      if (Elem.isTask(elem)) {
        return pipe(
          LifecycleUnits.render(root, elem),
          E.map((children) => {
            elem.nodes = children;
            loopNodes(stack, root, elem);
          }),
        );
      }
      else if (!hasSentPartial) {
        return pipe(
          LifecycleUnits.part(elem),
          E.map((did) => {
            hasSentPartial = did;
            loopNodes(stack, root, elem);
          }),
        );
      }

      loopNodes(stack, root, elem);

      return E.void;
    },
  });
};

export const hydrate = (root: Rehydrant) =>
  E.iterate(ML.make<Elem>(root.elem), {
    while: (stack) => !!ML.tail(stack),
    body : (stack) => {
      const elem = ML.pop(stack)!;

      if (Elem.isTask(elem)) {
        if (root.fibrils[elem.id!]) {
          elem.fibril = root.fibrils[elem.id!];
          elem.fibril.rehydrant = root;
        }

        return pipe(
          LifecycleUnits.render(root, elem),
          E.map((children) => {
            elem.nodes = children;
            return loopNodes(stack, root, elem);
          }),
        );
      }

      return E.succeed(loopNodes(stack, root, elem));
    },
  });

export const renderAgain = (root: Rehydrant) => {
  const stack = MutableList.empty<[Elem.Any, Elem | null]>();
  // eslint-disable-next-line prefer-const
  let hasSentPartial = false;

  const parents = new WeakMap<Elem, Elem>();
  parents.set(root.elem, root.elem);
  MutableList.append(stack, [root.elem, null]);

  const condition = () => MutableList.tail(stack);

  const body = () => {
    const [curr, next] = MutableList.pop(stack)!;

    if (next === null) {
      if (Elem.isTask(curr)) {
        return LifecycleUnits.render(root, curr).pipe(E.map((children) => {
          curr.nodes = children;
          ;
        }));
      }
    }
  };

  while (ML.tail(stack)) {
    const elem = ML.pop(stack)!;
  }
};

export const rerender = (root: Rehydrant) => E.gen(function* () {
  const stack = ML.empty<[Elem, Elem.Any[]]>();
  const hasSentPartial = false;

  if (Elem.isRest(root.elem)) {
    for (let i = 0; i < root.elem.nodes.length; i++) {
      const node = root.elem.nodes[i];

      if (Elem.isValue(node)) {
        continue;
      }
      else if (Elem.isTask(node)) {
        ML.append(stack, [node, yield* LifecycleUnits.render(root, node)]);
      }
      else {
        ML.append(stack, [node, node.nodes]);
      }
    }
  }
  else {
    ML.append(stack, [root.elem, yield* LifecycleUnits.render(root, root.elem)]);
  }

  while (ML.tail(stack)) {
    const [parent, rs] = ML.pop(stack)!;
    const maxlen = Math.max(parent.nodes.length, rs.length);

    for (let i = 0; i < maxlen; i++) {
      const curr = parent.nodes[i];
      const rend = rs[i];

      if (!curr) {
        if (Elem.isValue(rend)) {
          parent.nodes[i] = rend;
        }
        else {
          yield* mountSubtree(root, rend);
          parent.nodes[i] = rend;
        }
      }
      else if (!rend) {
        if (Elem.isValue(curr)) {
          delete parent.nodes[i];
        }
        else {
          dismountSubtree(root, curr);
          delete parent.nodes[i];
        }
      }

      else if (Elem.isValue(curr)) {
        if (Elem.isValue(rend)) {
          if (curr !== rend) {
            parent.nodes[i] = rend;
          }
        }
        else if (Elem.isRest(rend)) {
          yield* mountSubtree(root, rend);
          parent.nodes[i] = rend;
        }
        else {
          yield* mountSubtree(root, rend);
          parent.nodes[i] = rend;
        }
      }

      else if (Elem.isRest(curr)) {
        if (!hasSentPartial) {
          // hasSentPartial = yield* LifecycleUnits.part(curr);
        }

        if (Elem.isValue(rend)) {
          dismountSubtree(root, curr);
          parent.nodes[i] = rend;
        }
        else if (Elem.isRest(rend)) {
          if (curr.type !== rend.type) {
            dismountSubtree(root, curr);
            yield* mountSubtree(root, rend);
            parent.nodes[i] = rend;
          }
          if (!Props.isEqual(curr.props, rend.props)) {
            curr.props = rend.props;
          }
          ML.append(stack, [curr, rend.nodes]);
        }
        else {
          dismountSubtree(root, curr);
          yield* mountSubtree(root, rend);
          parent.nodes[i] = rend;
        }
      }

      else {
        if (Elem.isValue(rend)) { // Task => Primitive
          dismountSubtree(root, curr);
          parent.nodes[i] = rend;
        }
        else if (Elem.isRest(rend) || curr.idn !== rend.idn) { // Task => Rest or Task => Task
          dismountSubtree(root, curr);
          yield* mountSubtree(root, rend);
          parent.nodes[i] = rend;
        }
        else if (
          Props.isEqual(curr.props, rend.props) && // Task Changed
          Fibril.isSame(curr.fibril)
        ) {
          // console.log('same');
          // console.log(curr.id);
          // console.log(rend.type);
          // ML.append(stack, [curr, rend.nodes]);
        }
        else {
          const rerendered = yield* LifecycleUnits.render(root, curr);
          ML.append(stack, [curr, rerendered]);
        }
      }
    }
  }

  return root;
});

export const mountSubtree = (root: Rehydrant, elem: Elem) => E.gen(function* () {
  const stack = ML.make<Elem>(elem);

  while (ML.tail(stack)) {
    const elem = ML.pop(stack)!;

    if (Elem.isTask(elem)) {
      Rehydrant.mountTask(root, elem);
      elem.nodes = yield* LifecycleUnits.render(root, elem);
    }

    for (let i = 0; i < elem.nodes.length; i++) {
      const node = elem.nodes[i];

      if (!Elem.isValue(node)) {
        ML.append(stack, node);
      }
    }
  }
});

export const dismountSubtree = (root: Rehydrant, elem: Elem) => {
  const stack = ML.make<Elem>(elem);

  while (ML.tail(stack)) {
    const elem = ML.pop(stack)!;

    if (Elem.isTask(elem)) {
      Rehydrant.dismountTask(root, elem);
    }

    for (let i = 0; i < elem.nodes.length; i++) {
      const node = elem.nodes[i];

      if (!Elem.isValue(node)) {
        ML.append(stack, node);
      }
    }
  }
};
