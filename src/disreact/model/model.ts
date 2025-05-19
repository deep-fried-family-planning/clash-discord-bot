import type {Trigger} from '#src/disreact/model/elem/trigger.ts';
import {Lifecycles} from '#src/disreact/model/lifecycles.ts';
import type {Rehydrant} from '#src/disreact/model/meta/rehydrant.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {Sources} from '#src/disreact/model/Sources.ts';
import {pipe} from 'effect/Function';
import * as E from 'effect/Effect';
import type {Source} from './meta/source';
import {Pragma} from './pragma';

export * as Model from '#src/disreact/model/model.ts';
export type Model = never;

export const register = Sources.register;

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

export const invoke = (hydrator: Rehydrant.Decoded, event: Trigger, data?: any) =>
  pipe(
    Sources.rehydrate(hydrator),
    E.flatMap((original) =>
      pipe(
        Lifecycles.rehydrate(original, data),
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
                  Lifecycles.initialize(output, data),
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
