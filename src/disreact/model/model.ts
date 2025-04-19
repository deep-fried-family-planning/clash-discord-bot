import type {Rehydrant} from '#src/disreact/model/elem/rehydrant.ts';
import type {Trigger} from '#src/disreact/model/elem/trigger.ts';
import {Lifecycles} from '#src/disreact/model/lifecycles.ts';
import {Registry} from '#src/disreact/model/Registry.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {E, pipe} from '#src/disreact/utils/re-exports.ts';
import {Pragma} from './pragma';

export * as Model from '#src/disreact/model/model.ts';
export type Model = never;

export const create = (key: Registry.Key, props: any = {}) =>
  pipe(
    Registry.checkout(key, props),
    E.tap((root) => Lifecycles.initialize(root)),
    E.flatMap((root) => Pragma.encode(root)),
  );

export const rehydrate = (hydrator: Rehydrant.Decoded) =>
  pipe(
    Registry.rehydrate(hydrator),
    E.tap((root) => Lifecycles.rehydrate(root)),
    E.flatMap((root) => Pragma.encode(root)),
  );

export const invoke = (hydrator: Rehydrant.Decoded, event: Trigger) =>
  pipe(
    Registry.rehydrate(hydrator),
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
              relay.awaitOutput,
              E.flatMap((output) => {
                if (output === null) {
                  return E.succeed(output);
                }
                if (output.id === original.id) {
                  return Pragma.encode(output);
                }
                return pipe(
                  Lifecycles.initialize(output),
                  E.flatMap(() => Pragma.encode(output)),
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
