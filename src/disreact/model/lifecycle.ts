import {Dispatcher} from '#src/disreact/model/Dispatcher.ts';
import {Elem} from '#src/disreact/model/entity/elem.ts';
import type {Rehydrant} from '#src/disreact/model/entity/rehydrant.ts';
import {Registry} from '#src/disreact/model/Registry.ts';
import {Progress, Relay} from '#src/disreact/model/Relay.ts';
import {E, pipe, type RT} from '#src/disreact/utils/re-exports.ts';
import {Fibril} from './entity/fibril.ts';
import {Side} from './entity/side.ts';
import {Trigger} from './entity/trigger.ts';



export * as Lifecycle from './lifecycle.ts';
export type Lifecycle = never;

export const render = (root: Rehydrant, self: Elem.Task) => Dispatcher.use((dispatcher) =>
  pipe(
    dispatcher.lock,
    // E.tap(() => {console.log('renderElemPiped', self.idn);}),
    E.flatMap(() => {
      Fibril.λ.set(self.fibril);
      self.fibril.rehydrant = root;
      self.fibril.pc = 0;
      self.fibril.elem = self;
      self.fibril.rehydrant.fibrils[self.id!] = self.fibril;
      return Elem.render(self);
    }),
    E.tap((children) => {
      Fibril.λ.clear();
      return E.as(dispatcher.unlock, children);
    }),
    E.catchAll((err) => {
      Fibril.λ.clear();
      return E.fail(err);
    }),
    E.catchAllDefect((err) => {
      Fibril.λ.clear();
      return E.die(err);
    }),
    E.map((children) => {
      self.fibril.pc = 0;
      self.fibril.saved = structuredClone(self.fibril.stack);
      self.fibril.rc++;

      const filtered = children.filter(Boolean) as Elem.Any[];

      for (let i = 0; i < filtered.length; i++) {
        const node = filtered[i];

        if (!Elem.isPrim(node)) {
          Elem.connectChild(self, node, i);
        }
      }

      return filtered;
    }),
    E.tap(() => {
      if (self.fibril.queue.length) {
        const effects = Array<RT<typeof Side.apply>>(self.fibril.queue.length);

        for (let i = 0; i < effects.length; i++) {
          effects[i] = Side.apply(self.fibril.queue[i]);
        }

        return E.all(effects);
      }
    }),
    E.tap(() => Relay.use(() => {})),
  ),
);

export const invoke = (root: Rehydrant, elem: Elem.Rest, event: Trigger) => Relay.use((relay) =>
  pipe(
    Trigger.apply(elem.handler, event),
    E.tap(() => {
      if (root.next.id === null) {
        return E.zip(
          relay.setOutput(null),
          relay.sendStatus(Progress.Close()),
        );
      }

      if (root.next.id !== root.id) {
        const status = Progress.Next({
          id   : root.next.id!,
          props: root.next.props,
        });

        return pipe(
          Registry.use((registry) => registry.checkout(root.next.id!, root.next.props)),
          E.tap((nextRoot) =>
            E.zip(
              relay.setOutput(nextRoot),
              relay.sendStatus(status),
            ),
          ),
        );
      }

      return E.zip(
        relay.setOutput(root),
        relay.sendStatus(Progress.Same()),
      );
    }),
  ),
);
