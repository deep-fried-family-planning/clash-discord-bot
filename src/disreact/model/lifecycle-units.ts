import {Dispatcher} from '#src/disreact/model/Dispatcher.ts';
import {Elem} from '#src/disreact/model/entity/elem.ts';
import {Registry} from '#src/disreact/model/Registry.ts';
import type {Rehydrant} from '#src/disreact/model/entity/rehydrant.ts';
import {Progress, Relay} from '#src/disreact/model/Relay.ts';
import {E, pipe} from '#src/disreact/utils/re-exports.ts';
import {Fibril} from '#src/disreact/model/entity/fibril.ts';
import {Side} from '#src/disreact/model/entity/side.ts';
import {Trigger} from '#src/disreact/model/entity/trigger.ts';
import { FC } from '#src/disreact/model/entity/fc.ts';
import { Unsafe } from './entity/unsafe';

export * as LifecycleUnit from '#src/disreact/model/lifecycle-units.ts';
export type LifecycleUnit = never;

const withLock = <A, E, R>(effect: E.Effect<A, E, R>) => Dispatcher.use((dispatcher) =>
  pipe(
    dispatcher.lock,
    E.flatMap(() => effect),
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
  ),
);

export const mount = (root: Rehydrant, task: Elem.Task) => Dispatcher.use((dispatcher) =>
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
    E.tap(() => renderEffect(root, task.fibril)),
  ),
);

export const hydrate = (root: Rehydrant, task: Elem.Task) => Dispatcher.use((dispatcher) =>
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

export const render = (root: Rehydrant, task: Elem.Task) => Dispatcher.use((dispatcher) =>
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
    E.tap(() => renderEffect(root, task.fibril)),
  ),
);

const renderEffect = (root: Rehydrant, fibril: Fibril) => {
  if (fibril.queue.length) {
    const effects = Array<ReturnType<typeof Side.apply>>(fibril.queue.length);

    for (let i = 0; i < effects.length; i++) {
      effects[i] = Side.apply(fibril.queue[i]);
    }

    return pipe(
      E.all(effects),
      E.tap(() => {
        if (root.next.id === null) return close;
        if (root.next.id !== root.id) return next(root);
      }),
    );
  }
};

export const invoke = (root: Rehydrant, elem: Elem.Rest, event: Trigger) =>
  pipe(
    Trigger.apply(elem.handler!, event),
    E.tap(() => {
      if (root.next.id === null) return close;
      if (root.next.id !== root.id) return next(root);
      return same(root);
    }),
  );

export const part = (elem: Elem.Rest) => {
  if (elem.type === 'modal') {
    console.log('modal');
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
    console.log('message');
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

const close = Relay.use((relay) =>
  pipe(
    relay.setOutput(null),
    E.tap(() => relay.sendStatus(Progress.Close())),
  ),
);

const next = (root: Rehydrant) => Relay.use((relay) => {
  return pipe(
    Registry.use((registry) => registry.checkout(root.next.id!, root.next.props)),
    E.tap((nextRoot) => relay.setOutput(nextRoot)),
    E.tap(() =>
      relay.sendStatus(
        Progress.Next({
          id   : root.next.id!,
          props: root.next.props,
        }),
      ),
    ),
  );
});

const same = (root: Rehydrant) => Relay.use((relay) =>
  pipe(
    relay.setOutput(root),
    E.tap(() => relay.sendStatus(Progress.Same())),
  ),
);
