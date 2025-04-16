import {Codec} from '#src/disreact/codec/Codec.ts';
import type {Declare} from '#src/disreact/model/meta/declare.ts';
import {Dispatcher} from '#src/disreact/model/Dispatcher.ts';
import {Elem, type Task} from '#src/disreact/model/elem/elem.ts';
import {ASYNC, EFFECT, FC, SYNC} from '#src/disreact/model/meta/fc.ts';
import {Fibril} from '#src/disreact/model/meta/fibril.ts';
import {Props} from '#src/disreact/model/elem/props.ts';
import {Side} from '#src/disreact/model/meta/side.ts';
import {Trigger} from '#src/disreact/model/elem/trigger.ts';
import {Unsafe} from '#src/disreact/model/meta/unsafe.ts';
import {Registry} from '#src/disreact/model/Registry.ts';
import {Rehydrant} from '#src/disreact/model/rehydrant.ts';
import {Progress, Relay} from '#src/disreact/model/Relay.ts';
import {Data, E, ML, pipe} from '#src/disreact/utils/re-exports.ts';
import {Differ, MutableList, Predicate} from 'effect';
import { Hooks } from './hooks';

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
    return Elem.makeFragment(type, props);
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
    return Elem.makeFragment(type, props);
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
  if (Elem.isValue(elem)) {
    return Elem.cloneValue(elem) as A;
  }

  let first: A;

  if (Elem.isFragment(elem)) {
    first = Elem.cloneFragment(elem) as A;
  }
  else if (Elem.isRest(elem)) {
    first = Elem.cloneRest(elem) as A;
  }
  else {
    first = Elem.cloneTask(elem) as A;
  }

  const stack = ML.make<Elem>(elem);

  while (ML.tail(stack)) {
    const next = ML.pop(stack)!;

    let cloned: Elem;

    if (Elem.isValue(next)) {
      cloned = Elem.cloneValue(next);
      continue;
    }

    if (Elem.isFragment(elem)) {
      cloned = Elem.cloneFragment(elem);
    }
    else if (Elem.isRest(elem)) {
      cloned = Elem.cloneRest(elem);
    }
    else {
      cloned = Elem.cloneTask(elem);
    }

    for (let i = 0; i < cloned.nodes.length; i++) {
      const child = next.nodes[i];
      ML.append(stack, child);
    }
  }

  return first;
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
export const encode = (root: Rehydrant | null) => Codec.use((codec): Declare.Encoded => {
  if (!root) return null;
  if (Elem.isValue(root.elem)) return null;

  const result = {} as any,
        stack  = ML.make<[any, Elem[]]>([result, [root.elem]]),
        args   = new WeakMap<Elem.Node, any>();

  while (ML.tail(stack)) {
    const [acc, cs] = ML.pop(stack)!;

    for (let i = 0; i < cs.length; i++) {
      const c = cs[i];

      if (Elem.isValue(c)) {
        acc[codec.primitive] ??= [];
        acc[codec.primitive].push(c);
      }
      else if (Elem.isFragment(c)) {
        ML.append(stack, [acc, c.nodes]);
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
        _tag     : key,
        rehydrant: Rehydrant.dehydrate(root),
        data     : result[key][0],
      };
    }
  }

  return null;
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

/**
 * @summary invoke
 */
export const invoke = (root: Rehydrant, event: Trigger) => E.suspend(() => {
  const stack = ML.make<Elem>(root.elem);

  while (ML.tail(stack)) {
    const elem = ML.pop(stack)!;

    if (Elem.isValue(elem)) continue;

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
 * @summary render
 */
export const task = (root: Rehydrant, elem: Task) => Dispatcher.use((dispatcher) => {
  const fc = elem.type;
  const p = elem.props;
  root.fibrils[elem.id!] = elem.fibril;
  elem.fibril.elem = elem;
  elem.fibril.rehydrant = root;
  //
  // if (FC.isSync(fc)) {
  //   return pipe(
  //     dispatcher.lock,
  //     E.flatMap(() => {
  //       Hooks.setup(task.fibril);
  //       return E.sync(() => fc(p));
  //     }),
  //     E.tap(() => {
  //       Hooks.setup(undefined);
  //       return dispatcher.unlock;
  //     }),
  //   );
  // }
  // if (FC.isAsync(fc)) {
  //   return E.promise(async () => await fc(p));
  // }
  // if (FC.isEffect(fc)) {
  //   return fc(p);
  // }

  return pipe(
    dispatcher.lock,
    E.flatMap(() => {
      Hooks.setup(elem.fibril);

      if (FC.isSync(fc)) {
        return E.sync(() => fc(p));
      }
      if (FC.isAsync(fc)) {
        return E.promise(async () => await fc(p));
      }
      if (FC.isEffect(fc)) {
        return fc(p);
      }

      return pipe(
        E.sync(() => fc(p)),
        E.flatMap((children) => {
          if (Predicate.isPromise(children)) {
            fc[FC.TypeId] = ASYNC;
            return E.promise(async () => await children);
          }

          if (E.isEffect(children)) {
            fc[FC.TypeId] = EFFECT;
            return children;
          }

          fc[FC.TypeId] = SYNC;
          return E.succeed(children);
        }),
      );
    }),
    E.flatMap((children) => {
      Hooks.setup(undefined);
      Fibril.commit(elem.fibril);
      return E.as(dispatcher.unlock, Elem.connectChildren(elem, children));
    }),
    E.catchAllDefect((e) => {
      Hooks.setup(undefined);
      return E.zipRight(dispatcher.unlock, E.fail(e as Error));
    }),
  );
});

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
const renderMount = (root: Rehydrant, elem: Elem.Task) =>
  pipe(
    task(root, elem),
    E.tap((children) => {
      elem.nodes = children;

      for (let i = 0; i < elem.nodes.length; i++) {
        const node = elem.nodes[i];

        if (!Elem.isValue(node)) {
          MutableList.append(root.mount, node);
        }
      }

      return effect(root, elem.fibril);
    }),
    E.asVoid,
  );

/**
 * @summary mount
 */
const mount = (root: Rehydrant, elem: Elem.Node) => {
  MutableList.append(root.mount, elem);

  return E.whileLoop({
    while: () => !!MutableList.tail(root.mount),
    step : () => {},
    body : () => {
      const next = MutableList.pop(root.mount)!;

      if (Elem.isTask(next)) {
        Rehydrant.mountTask(root, next);
        return renderMount(root, next);
      }

      for (let i = 0; i < next.nodes.length; i++) {
        const child = next.nodes[i];

        if (!Elem.isValue(child)) {
          Elem.connectChild(next, child, i);
          MutableList.append(root.mount, child);
        }
      }

      return E.void;
    },
  });
};

/**
 * @summary mount
 */
export const initialize = (root: Rehydrant) => mount(root, root.elem);

/**
 * @summary rehydrate
 */
const rehydrateRender = (root: Rehydrant, elem: Elem.Task) =>
  pipe(
    task(root, elem),
    E.map((children) => {
      Fibril.commit(elem.fibril);
      elem.nodes = children.filter(Boolean);

      for (let i = 0; i < elem.nodes.length; i++) {
        const node = elem.nodes[i];

        if (!Elem.isValue(node)) {
          Elem.connectChild(elem, node, i);
          MutableList.append(root.mount, node);
        }
      }

      return elem.nodes;
    }),
  );

/**
 * @summary rehydrate
 */
export const rehydrate = (root: Rehydrant) => {
  MutableList.append(root.mount, root.elem);

  return E.iterate(undefined as any, {
    while: () => !!MutableList.tail(root.mount),
    body : () => {
      const next = MutableList.pop(root.mount)!;

      if (Elem.isTask(next)) {
        if (root.fibrils[next.id!]) {
          next.fibril = root.fibrils[next.id!];
          next.fibril.rehydrant = root;
          next.fibril.rc = 1;
        }
        return rehydrateRender(root, next);
      }

      for (let i = 0; i < next.nodes.length; i++) {
        const child = next.nodes[i];

        if (!Elem.isValue(child)) {
          Elem.connectChild(next, child, i);
          MutableList.append(root.mount, child);
        }
      }

      return E.void;
    },
  });
};

/**
 * @summary dismount
 */
export const dismount = (root: Rehydrant, elem: Elem.Node) => {
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

/**
 * @summary render
 */
const renderTask = (root: Rehydrant, elem: Elem.Task) =>
  pipe(
    task(root, elem),
    E.map((children) => {
      Fibril.commit(elem.fibril);
      const nodes = children.filter(Boolean);

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (!Elem.isValue(node)) {
          Elem.connectChild(elem, node, i);
        }
      }

      return nodes;
    }),
    E.tap(() => effect(root, elem.fibril)),
  );

export const renderAgain = (root: Rehydrant) => {
  const stack = MutableList.empty<[Elem, Elem] | [Elem.Task]>();
  // eslint-disable-next-line prefer-const
  let hasSentPartial = false;

  const parents = new WeakMap<Elem.Node, Elem>();
  parents.set(root.elem, root.elem);
  MutableList.append(stack, [root.elem, null]);

  const condition = () => MutableList.tail(stack);

  const body = () => {
    const pop = MutableList.pop(stack)!;

    if (pop.length === 1) {
      return pipe(
        task(root, pop[0]),
        E.map((children) => {
          for (let i = 0; i < children.length; i++) {
            const child = children[i];
          }
        }),
      );
    }

    const [curr, next] = pop;

    if (next === null) {
      if (Elem.isTask(curr)) {
        return renderTask(root, curr).pipe(E.map((children) => {
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
  const stack = ML.empty<[Elem.Node, Elem[]]>();
  const hasSentPartial = false;

  if (Elem.isRest(root.elem) || Elem.isFragment(root.elem)) {
    for (let i = 0; i < root.elem.nodes.length; i++) {
      const node = root.elem.nodes[i];

      if (Elem.isValue(node)) {
        continue;
      }
      else if (Elem.isTask(node)) {
        ML.append(stack, [node, yield* renderTask(root, node)]);
      }
      else {
        ML.append(stack, [node, node.nodes]);
      }
    }
  }
  else {
    ML.append(stack, [root.elem, yield* renderTask(root, root.elem)]);
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
          yield* mount(root, rend);
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
          yield* mount(root, rend);
          parent.nodes[i] = rend;
        }
        else {
          yield* mount(root, rend);
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
            yield* mount(root, rend);
            parent.nodes[i] = rend;
          }
          if (!Props.isEqual(curr.props, rend.props)) {
            curr.props = rend.props;
          }
          ML.append(stack, [curr, rend.nodes]);
        }
        else {
          dismount(root, curr);
          yield* mount(root, rend);
          parent.nodes[i] = rend;
        }
      }

      else if (Elem.isFragment(curr)) {
        if (!hasSentPartial) {
          // hasSentPartial = yield* LifecycleUnits.part(curr);
        }

        if (Elem.isValue(rend)) {
          dismount(root, curr);
          parent.nodes[i] = rend;
        }
        else if (Elem.isRest(rend)) {
          dismount(root, curr);
          parent.nodes[i] = rend;
        }
        else if (Elem.isFragment(rend)) {
          if (curr.type !== rend.type) {
            dismount(root, curr);
            yield* mount(root, rend);
            parent.nodes[i] = rend;
          }
          if (!Props.isEqual(curr.props, rend.props)) {
            curr.props = rend.props;
          }
          ML.append(stack, [curr, rend.nodes]);
        }
        else {
          dismount(root, curr);
          yield* mount(root, rend);
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
          yield* mount(root, rend);
          parent.nodes[i] = rend;
        }
        else if (Elem.isFragment(rend) || curr.idn !== rend.idn) { // Task => Rest or Task => Task
          dismount(root, curr);
          yield* mount(root, rend);
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
          const rerendered = yield* renderTask(root, curr);
          ML.append(stack, [curr, rerendered]);
        }
      }
    }
  }

  return root;
});
