import {Dispatcher} from '#src/disreact/model/Dispatcher.ts';
import type {Trigger} from '#src/disreact/model/elem/trigger.ts';
import {Hooks} from '#src/disreact/model/hooks.ts';
import {Lifecycles} from '#src/disreact/model/lifecycles.ts';
import type {Declare} from '#src/disreact/model/exp/declare.ts';
import type {Rehydrant} from '#src/disreact/model/elem/rehydrant.ts';
import {Registry} from '#src/disreact/model/Registry.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {E, pipe} from '#src/disreact/utils/re-exports.ts';
import {FiberMap} from 'effect';

export const makeEntrypoint = (key: Registry.Key, props?: any) =>
  pipe(
    Registry.checkout(key, props),
    E.tap((root) => Lifecycles.initialize(root)),
    E.flatMap((root) =>
      pipe(
        Lifecycles.encode(root),
        E.map((encoded) => [root, encoded] as const),
      ),
    ),
  );

export const hydrateInvoke = (dehydrated: Rehydrant.Decoded, event: Trigger) =>
  pipe(
    Registry.rehydrate(dehydrated),
    E.tap((original) =>
      pipe(
        Lifecycles.rehydrate(original),
        E.andThen(() => Lifecycles.invoke(original, event)),
        E.andThen(() => Lifecycles.rerender(original)),
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
            return Lifecycles.initialize(output);
          }),
          E.tap(() => relay.setComplete()),
        ),
      ),
    ),
  );

;

const make = pipe(
  E.all({
    roots: FiberMap.make<string, Declare.Encoded>(),
  }),
  E.map(({roots}) => {
    const create = (id: string, key: Registry.Key, props: any = {}) =>
      pipe(
        Registry.checkout(key, props),
        E.tap((root) => Lifecycles.initialize(root)),
        E.flatMap((root) => Lifecycles.encode(root)),
        FiberMap.run(roots, id),
      );

    const invoke = (id: string, rehydrant: Rehydrant.Decoded, event: Trigger) =>
      pipe(
        Registry.rehydrate(rehydrant),
        E.flatMap((original) =>
          pipe(
            Lifecycles.rehydrate(original),
            E.andThen(() => Lifecycles.invoke(original, event)),
            E.andThen(() => Lifecycles.rerender(original)),
            E.andThen(() =>
              Relay.use((relay) =>
                relay.setOutput(original),
              ),
            ),
            E.zipRight(
              Relay.use((relay) =>
                pipe(
                  relay.awaitOutput(),
                  E.flatMap((output) => {
                    if (output === null) {
                      return E.succeed(output);
                    }
                    if (output.id === original.id) {
                      return Lifecycles.encode(output);
                    }
                    return pipe(
                      Lifecycles.initialize(output),
                      E.flatMap(() => Lifecycles.encode(output)),
                    );
                  }),
                  E.tap(() => relay.setComplete()),
                ),
              ),
              {concurrent: true},
            ),
          ),
        ),
        FiberMap.run(roots, id),
      );

    return {
      create,
      invoke,
    };
  }),
);

export class Model extends E.Service<Model>()('disreact/Model', {
  effect      : make,
  dependencies: [
    Dispatcher.Default,
    Registry.Default,
  ],
}) {
  static readonly impl = {
    useState  : Hooks.$useState,
    useReducer: Hooks.$useReducer,
    useEffect : Hooks.$useEffect,
    usePage   : Hooks.$usePage,
    useIx     : Hooks.$useIx,
  };

  static readonly create = (key: Registry.Key, props: any = {}) =>
    pipe(
      Registry.checkout(key, props),
      E.tap((root) => Lifecycles.initialize(root)),
      E.flatMap((root) => Lifecycles.encode(root)),
    );

  static readonly invoke = (rehydrant: Rehydrant.Decoded, event: Trigger) =>
    pipe(
      Registry.rehydrate(rehydrant),
      E.flatMap((original) =>
        pipe(
          Lifecycles.rehydrate(original),
          E.andThen(() => Lifecycles.invoke(original, event)),
          E.andThen(() => Lifecycles.rerender(original)),
          E.andThen(() =>
            Relay.use((relay) =>
              relay.setOutput(original),
            ),
          ),
          E.zipRight(
            Relay.use((relay) =>
              pipe(
                relay.awaitOutput(),
                E.flatMap((output) => {
                  if (output === null) {
                    return E.succeed(output);
                  }
                  if (output.id === original.id) {
                    return Lifecycles.encode(output);
                  }
                  return pipe(
                    Lifecycles.initialize(output),
                    E.flatMap(() => Lifecycles.encode(output)),
                  );
                }),
                E.tap(() => relay.setComplete()),
              ),
            ),
            {concurrent: true},
          ),
        ),
      ),
    );
}
