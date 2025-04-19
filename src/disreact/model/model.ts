import {Dispatcher} from '#src/disreact/model/Dispatcher.ts';
import type {Rehydrant} from '#src/disreact/model/meta/rehydrant.ts';
import type {Trigger} from '#src/disreact/model/elem/trigger.ts';
import {Lifecycles} from '#src/disreact/model/lifecycles.ts';
import {Sources} from '#src/disreact/model/Sources.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {E, L, pipe} from '#src/disreact/utils/re-exports.ts';
import {Pragma} from './pragma';
import type { Source } from './meta/source';

export * as Model from '#src/disreact/model/model.ts';
export type Model = never;

export const defaultLayers = L.mergeAll(
  Sources.Default,
  Dispatcher.Default,
  Relay.Default,
);

export const create = (key: Source.Key, props: any = {}) =>
  pipe(
    Sources.checkout(key, props),
    E.tap((root) => Lifecycles.initialize(root)),
    E.flatMap((root) => Pragma.encode(root)),
  );

export const rehydrate = (hydrator: Rehydrant.Decoded) =>
  pipe(
    Sources.rehydrate(hydrator),
    E.tap((root) => Lifecycles.rehydrate(root)),
    E.flatMap((root) => Pragma.encode(root)),
  );

export const invoke = (hydrator: Rehydrant.Decoded, event: Trigger) =>
  pipe(
    Sources.rehydrate(hydrator),
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
