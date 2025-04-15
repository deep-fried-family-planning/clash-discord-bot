import {Dispatcher} from '#src/disreact/model/Dispatcher.ts';
import type {Rehydrant} from '#src/disreact/model/entity/rehydrant.ts';
import type {Trigger} from '#src/disreact/model/entity/trigger.ts';
import {Hooks} from '#src/disreact/model/hooks.ts';
import {Lifecycle} from '#src/disreact/model/lifecycle.ts';
import {Registry} from '#src/disreact/model/Registry.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {E, pipe} from '#src/disreact/utils/re-exports.ts';
import {FiberMap} from 'effect';

export const makeEntrypoint = (key: Registry.Key, props?: any) =>
  pipe(
    Registry.checkout(key, props),
    E.tap((root) => Lifecycle.initialize(root)),
    E.flatMap((root) =>
      pipe(
        Lifecycle.encode(root),
        E.map((encoded) => [root, encoded] as const),
      ),
    ),
  );

export const hydrateInvoke = (dehydrated: Rehydrant.Decoded, event: Trigger) =>
  pipe(
    Registry.rehydrate(dehydrated),
    E.tap((original) =>
      pipe(
        Lifecycle.hydrate(original),
        E.andThen(() => Lifecycle.handleEvent(original, event)),
        E.andThen(() => Lifecycle.rerender(original)),
        E.andThen(() =>
          Relay.use((relay) =>
            relay.setOutput(original),
          ),
        ),
      ),
    ),
    E.flatMap((original) =>
      Relay.use((relay) =>
        pipe(
          relay.awaitOutput(),
          E.tap((output) => {
            if (output === null || output.id === original.id) {
              return;
            }
            return Lifecycle.initialize(output);
          }),
          E.tap(() => relay.setComplete()),
        ),
      ),
    ),
  );

export class Model extends E.Service<Model>()('disreact/Model', {
  effect: pipe(
    E.all({
      roots: FiberMap.make<Rehydrant.Rehydrant, Rehydrant>(),
    }),
    E.map(() => {
      return {};
    }),
  ),
  dependencies: [
    Dispatcher.Default,
    Registry.Default,
  ],
}) {
  static readonly makeEntrypoint = makeEntrypoint;
  static readonly hydrateInvoke = hydrateInvoke;

  static readonly impl = {
    useState  : Hooks.$useState,
    useReducer: Hooks.$useReducer,
    useEffect : Hooks.$useEffect,
    usePage   : Hooks.$usePage,
    useIx     : Hooks.$useIx,
  };
}
