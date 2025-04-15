import {HooksDispatcher} from '#src/disreact/model/HooksDispatcher.ts';
import {Elem} from '#src/disreact/model/entity/elem.ts';
import type {RegistryDefect} from '#src/disreact/model/Registry.ts';
import {Registry} from '#src/disreact/model/Registry.ts';
import type {Rehydrant} from '#src/disreact/model/entity/rehydrant.ts';
import {Progress, Relay} from '#src/disreact/model/Relay.ts';
import {E, pipe} from '#src/disreact/utils/re-exports.ts';
import type {Cause} from 'effect';
import type {Fibril} from '#src/disreact/model/entity/fibril.ts';
import {Side} from '#src/disreact/model/entity/side.ts';
import {Trigger} from './entity/trigger.ts';
import { FC } from '#src/disreact/model/entity/fc.ts';

export * as Lifecycle from './lifecycle.ts';
export type Lifecycle = never;

/**
 * create
 */
export const jsx = (type: any, props: any) => {

};

/**
 * create
 */
export const jsxs = (type: any, props: any) => {

};

/**
 * create
 */
export const jsxDEV = (type: any, props: any) => {

};

/**
 * clone
 */
export const clone = () => {};

/**
 * render
 */
export const render = (root: Rehydrant, self: Elem.Task) => HooksDispatcher.use((dispatcher) =>
  pipe(
    dispatcher.lock,
    E.flatMap(() => {
      HooksDispatcher.setGlobal(self.fibril);
      self.fibril.rehydrant = root;
      self.fibril.pc = 0;
      self.fibril.elem = self;
      self.fibril.rehydrant.fibrils[self.id!] = self.fibril;
      return FC.render(self.type, self.props);
    }),
    E.tap((children) => {
      HooksDispatcher.setGlobal(null);
      return E.as(dispatcher.unlock, children);
    }),
    E.catchAllDefect((err) => {
      HooksDispatcher.setGlobal(null);
      return E.fail(err as Error);
    }),
    E.map((children) => {
      self.fibril.pc = 0;
      self.fibril.saved = structuredClone(self.fibril.stack);
      self.fibril.rc++;
      const filtered = children.filter(Boolean) as Elem.Any[];

      for (let i = 0; i < filtered.length; i++) {
        const node = filtered[i];

        if (!Elem.isValue(node)) {
          Elem.connectChild(self, node, i);
        }
      }

      return filtered;
    }),
    E.tap(() => renderEffect(root, self.fibril) as E.Effect<void, RegistryDefect | Cause.UnknownException, Registry | Relay>),
  ),
);

/**
 * render
 */
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

/**
 * render
 */
export const invoke = (root: Rehydrant, elem: Elem.Rest, event: Trigger) =>
  pipe(
    Trigger.apply(elem.handler!, event),
    E.tap(() => {
      if (root.next.id === null) return close;
      if (root.next.id !== root.id) return next(root);
      return same(root);
    }),
  );

/**
 * notify
 */
export const part = (elem: Elem.Rest) => {
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
 * notify
 */
const close = Relay.use((relay) =>
  pipe(
    relay.setOutput(null),
    E.tap(() => relay.sendStatus(Progress.Close())),
  ),
);

/**
 * notify
 */
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

/**
 * notify
 */
const same = (root: Rehydrant) => Relay.use((relay) =>
  pipe(
    relay.setOutput(root),
    E.tap(() => relay.sendStatus(Progress.Same())),
  ),
);
