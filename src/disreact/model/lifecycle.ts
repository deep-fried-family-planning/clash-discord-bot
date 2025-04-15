import {Codec} from '#src/disreact/codec/Codec.ts';
import {Dispatcher} from '#src/disreact/model/Dispatcher.ts';
import {Elem} from '#src/disreact/model/entity/elem.ts';
import {FC} from '#src/disreact/model/entity/fc.ts';
import {Fibril} from '#src/disreact/model/entity/fibril.ts';
import {Props} from '#src/disreact/model/entity/props.ts';
import {Rehydrant} from '#src/disreact/model/entity/rehydrant.ts';
import {Side} from '#src/disreact/model/entity/side.ts';
import {Trigger} from '#src/disreact/model/entity/trigger.ts';
import {Unsafe} from '#src/disreact/model/entity/unsafe.ts';
import {Registry} from '#src/disreact/model/Registry.ts';
import {Progress, Relay} from '#src/disreact/model/Relay.ts';
import {E, ML, pipe} from '#src/disreact/utils/re-exports.ts';
import {MutableList} from 'effect';

export * as Lifecycle from '#src/disreact/model/lifecycle.ts';
export type Lifecycle = never;

/**
 * @summary jsx
 */
export const Fragment = undefined;

/**
 * @summary jsx
 */
export const jsx = (type: any, props: any): Elem => {
  if (Elem.isFragmentType(type)) {
    return props.children;
  }
  if (Elem.isRestType(type)) {
    const children = props.children ? [props.children] : [];
    delete props.children;
    return Elem.makeRest(type, props, children);
  }
  if (Elem.isTaskType(type)) {
    return Elem.makeTask(type, props);
  }
  throw new Error(`Invalid JSX: ${String(type)}`);
};

/**
 * @summary jsx
 */
export const jsxs = (type: any, props: any): Elem => {
  props.children = props.children.flat();

  if (Elem.isFragmentType(type)) {
    return props.children;
  }
  if (Elem.isRestType(type)) {
    const children = props.children;
    delete props.children;
    return Elem.makeRest(type, props, children);
  }
  if (Elem.isTaskType(type)) {
    return Elem.makeTask(type, props);
  }
  throw new Error(`Invalid JSX: ${String(type)}`);
};

/**
 * @summary jsx
 */
export const jsxDEV = (type: any, props: any): Elem => {
  if (Array.isArray(props.children)) {
    return jsxs(type, props);
  }
  return jsx(type, props);
};

/**
 * @summary clone
 */
export const clone = <A extends Elem>(elem: A): A => {
  if (Elem.isRest(elem)) {
    return Elem.cloneRest(elem) as A;
  }
  return Elem.cloneTask(elem) as A;
};

/**
 * @summary encode
 */
const removeUndefined = (encoded: any): any => {
  for (const key in Object.keys(encoded)) {
    if (encoded[key] === undefined) {
      delete encoded[key];
    }
  }
  return encoded;
};

/**
 * @summary encode
 */
export const encode = (root: Rehydrant) => Codec.use((codec): Elem.Encoded => {
  if (Elem.isValue(root.elem)) {
    return null;
  }

  const result = {} as any,
        stack  = ML.make<[any, Elem.Any[]]>([result, [root.elem]]),
        args   = new WeakMap<Elem, any>();

  while (ML.tail(stack)) {
    const [acc, cs] = ML.pop(stack)!;

    for (let i = 0; i < cs.length; i++) {
      const c = cs[i];

      if (Elem.isValue(c)) {
        acc[codec.primitive] ??= [];
        acc[codec.primitive].push(c);
      }
      else if (args.has(c as any)) {
        if (Elem.isRest(c)) {
          const norm = codec.normalization[c.type as any];
          const arg = args.get(c)!;
          acc[norm] ??= [];
          acc[norm].push(removeUndefined(codec.encoding[c.type](c, removeUndefined(arg))));
        }
      }
      else if (!c.nodes.length) {
        if (Elem.isRest(c)) {
          const norm = codec.normalization[c.type as any];
          const arg = {} as any;
          args.set(c, arg);
          acc[norm] ??= [];
          acc[norm].push(removeUndefined(codec.encoding[c.type](c, removeUndefined(arg))));
        }
      }
      else {
        ML.append(stack, [acc, cs.slice(i)]);
        const arg = {} as any;
        args.set(c, arg);

        if (Elem.isRest(c)) {
          ML.append(stack, [arg, c.nodes]);
        }
        else {
          ML.append(stack, [acc, c.nodes]);
        }
        break;
      }
    }
  }

  for (const key of Object.keys(result)) {
    if (result[key]) {
      return {
        _tag: key,
        data: result[key][0],
      };
    }
  }

  return null;
});

/**
 * @summary render
 */
const renderMount = (root: Rehydrant, task: Elem.Task) => Dispatcher.use((dispatcher) =>
  pipe(
    dispatcher.lock,
    E.flatMap(() => {
      Fibril.init(root, task, task.fibril);
      Unsafe.setNode(task.fibril);
      return FC.render(task.type, task.props);
    }),
    E.tap(() => {
      Unsafe.setNode(undefined);
      return dispatcher.unlock;
    }),
    E.catchAllDefect((e) => {
      Unsafe.setNode(undefined);

      return E.zipRight(
        dispatcher.unlock,
        E.fail(e as Error),
      );
    }),
    E.map((children) => {
      Fibril.commit(task.fibril);
      task.nodes = children.filter(Boolean) as Elem.Any[];
      Elem.connectNodes(task, task.nodes);
      return task.nodes;
    }),
    E.tap(() => effect(root, task.fibril)),
  ),
);

/**
 * @summary render
 */
const renderRehydrate = (root: Rehydrant, task: Elem.Task) => Dispatcher.use((dispatcher) =>
  pipe(
    dispatcher.lock,
    E.flatMap(() => {
      Fibril.hydrate(root, task, task.fibril);
      Unsafe.setNode(task.fibril);
      return FC.render(task.type, task.props);
    }),
    E.tap(() => {
      Unsafe.setNode(undefined);
      return dispatcher.unlock;
    }),
    E.catchAllDefect((e) => {
      Unsafe.setNode(undefined);

      return E.zipRight(
        dispatcher.unlock,
        E.fail(e as Error),
      );
    }),
    E.map((children) => {
      Fibril.commit(task.fibril);
      task.nodes = children.filter(Boolean) as Elem.Any[];
      Elem.connectNodes(task, task.nodes);
      return task.nodes;
    }),
  ),
);

/**
 * @summary render
 */
const render = (root: Rehydrant, task: Elem.Task) => Dispatcher.use((dispatcher) =>
  pipe(
    dispatcher.lock,
    E.flatMap(() => {
      Fibril.connect(root, task, task.fibril);
      Unsafe.setNode(task.fibril);
      return FC.render(task.type, task.props);
    }),
    E.tap(() => {
      Unsafe.setNode(undefined);
      return dispatcher.unlock;
    }),
    E.catchAllDefect((e) => {
      Unsafe.setNode(undefined);

      return E.zipRight(
        dispatcher.unlock,
        E.fail(e as Error),
      );
    }),
    E.map((children) => {
      Fibril.commit(task.fibril);
      const nodes = children.filter(Boolean) as Elem.Any[];
      Elem.connectNodes(task, nodes);
      return nodes;
    }),
    E.tap(() => effect(root, task.fibril)),
  ),
);

/**
 * @summary render
 */
const effect = (root: Rehydrant, fibril: Fibril) => {
  if (fibril.queue.length) {
    const effects = Array<ReturnType<typeof Side.apply>>(fibril.queue.length);

    for (let i = 0; i < effects.length; i++) {
      effects[i] = Side.apply(fibril.queue[i]);
    }

    return pipe(
      E.all(effects),
      E.tap(() => {
        if (root.next.id === null) return relayClose();
        if (root.next.id !== root.id) return relayNext(root);
      }),
    );
  }
};

/**
 * @summary mount
 */
export const initialize = (root: Rehydrant) => initializeSubtree(root, root.elem);

/**
 * @summary mount
 */
const mount = (root: Rehydrant, elem: Elem) => initializeSubtree(root, elem);

/**
 * @summary mount
 */
export const rehydrate = (root: Rehydrant) => {};

/**
 * @summary dismount
 */
const dismount = (root: Rehydrant, elem: Elem) => {
  MutableList.append(root.dismount, elem);

  while (MutableList.tail(root.dismount)) {
    const next = MutableList.pop(root.dismount)!;

    if (Elem.isTask(next)) {
      // @ts-expect-error temporary
      delete next.fibril.elem;
      // @ts-expect-error temporary
      delete next.fibril.rehydrant;
      // @ts-expect-error temporary
      delete next.fibril;
      delete root.fibrils[next.id!];
    }

    for (const child of next.nodes) {
      if (Elem.isValue(child)) continue;
      MutableList.append(root.dismount, child);
    }
  }
};

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
          renderMount(root, elem),
          E.tap(() => {
            loopNodes(stack, root, elem);
          }),
        );
      }
      else if (!hasSentPartial) {
        return pipe(
          relayPartial(elem),
          E.tap((did) => {
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
          render(root, elem),
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
        return render(root, curr).pipe(E.map((children) => {
          curr.nodes = children;
        }));
      }
    }
  };

  while (ML.tail(stack)) {
    const elem = ML.pop(stack)!;
  }
};

/**
 * @summary render
 */
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
        ML.append(stack, [node, yield* render(root, node)]);
      }
      else {
        ML.append(stack, [node, node.nodes]);
      }
    }
  }
  else {
    ML.append(stack, [root.elem, yield* render(root, root.elem)]);
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
          dismount(root, curr);
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
          dismount(root, curr);
          parent.nodes[i] = rend;
        }
        else if (Elem.isRest(rend)) {
          if (curr.type !== rend.type) {
            dismount(root, curr);
            yield* mountSubtree(root, rend);
            parent.nodes[i] = rend;
          }
          if (!Props.isEqual(curr.props, rend.props)) {
            curr.props = rend.props;
          }
          ML.append(stack, [curr, rend.nodes]);
        }
        else {
          dismount(root, curr);
          yield* mountSubtree(root, rend);
          parent.nodes[i] = rend;
        }
      }

      else {
        if (Elem.isValue(rend)) { // Task => Primitive
          dismount(root, curr);
          parent.nodes[i] = rend;
        }
        else if (Elem.isRest(rend) || curr.idn !== rend.idn) { // Task => Rest or Task => Task
          dismount(root, curr);
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
          const rerendered = yield* render(root, curr);
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
      elem.nodes = yield* render(root, elem);
    }

    for (let i = 0; i < elem.nodes.length; i++) {
      const node = elem.nodes[i];

      if (!Elem.isValue(node)) {
        ML.append(stack, node);
      }
    }
  }
});

/**
 * @summary invoke
 */
export const handleEvent = (root: Rehydrant, event: Trigger) => E.suspend(() => {
  const stack = ML.make<Elem>(root.elem);

  while (ML.tail(stack)) {
    const elem = ML.pop(stack)!;

    if (Trigger.isTarget(event, elem)) {
      return pipe(
        Trigger.apply(elem.handler!, event),
        E.tap(() => {
          if (root.next.id === null) return relayClose();
          if (root.next.id !== root.id) return relayNext(root);
          return relaySame(root);
        }),
      );
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

/**
 * @summary relay
 */
const relayClose = () => Relay.use((relay) =>
  pipe(
    relay.setOutput(null),
    E.tap(() => relay.sendStatus(
      Progress.Close(),
    )),
  ),
);

/**
 * @summary relay
 */
const relaySame = (root: Rehydrant) => Relay.use((relay) =>
  pipe(
    relay.setOutput(root),
    E.tap(() => relay.sendStatus(
      Progress.Same(),
    )),
  ),
);

/**
 * @summary relay
 */
const relayNext = (root: Rehydrant) => Relay.use((relay) =>
  pipe(
    Registry.use((registry) => registry.checkout(root.next.id!, root.next.props)),
    E.tap((next) => relay.setOutput(next)),
    E.tap(() => relay.sendStatus(
      Progress.Next({
        id   : root.next.id,
        props: root.next.props,
      }),
    )),
  ),
);

/**
 * @summary relay
 */
const relayPartial = (elem: Elem.Rest) => {
  if (elem.type === 'modal') {
    return pipe(
      Relay.use((relay) => relay.sendStatus(
        Progress.Part({
          type: 'modal',
        }),
      )),
      E.as(true),
    );
  }

  if (elem.type === 'message') {
    return pipe(
      Relay.use((relay) =>
        relay.sendStatus(
          Progress.Part({
            type       : 'message',
            isEphemeral: elem.props.display === 'ephemeral' ? true : false,
          }),
        ),
      ),
      E.as(true),
    );
  }

  return E.succeed(false);
};
