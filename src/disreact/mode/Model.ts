import {Dispatcher} from '#src/disreact/mode/Dispatcher.ts';
import {RehydrantDOM} from '#src/disreact/mode/RehydrantDOM.ts';
import {RehydrantEncoder, type RehydrantEncoderConfig} from '#src/disreact/mode/RehydrantEncoder.ts';
import {Rehydrator, type RehydratorConfig} from '#src/disreact/mode/Rehydrator.ts';
import type {Rehydrant} from '#src/disreact/mode/entity/rehydrant.ts';
import * as E from 'effect/Effect';
import * as L from 'effect/Layer';
import {pipe} from 'effect/Function';
import * as Lifecycle from './lifecycle.ts';
import type * as El from './entity/el.ts';

export const synthesize = () =>
  pipe(
    null,
  );

export const registerRoot = (source: Rehydrant.Registrant, id?: string) =>
  Rehydrator.register(source, id);

export const createRoot = (source: Rehydrant.SourceId, props?: any, data?: any) =>
  pipe(
    Rehydrator.checkout(source, props, data),
    E.flatMap((root) => Lifecycle.initialize(root)),
    E.flatMap((root) => RehydrantEncoder.encode(root)),
  );

export const invokeRoot = (hydrator: Rehydrant.Hydrator, event: El.Event, data?: any) =>
  pipe(
    Rehydrator.rehydrate(hydrator, data),
    E.flatMap((root) => Lifecycle.rehydrate(root)),
    E.flatMap((root) => Lifecycle.invoke(root, event)),
    E.flatMap((root) => Lifecycle.rerender(root)),
    E.zipRight(
      RehydrantDOM.output(),
      {concurrent: true},
    ),
    E.flatMap((output) => {
      if (output === null) {
        return E.succeed(null);
      }
      if (output.id === hydrator.id) {
        return E.succeed(output);
      }
      return Lifecycle.initialize(output);
    }),
    E.flatMap((root) => RehydrantEncoder.encode(root)),
  );

export const layer = (
  config: {
    register?: RehydratorConfig;
    encoding?: RehydrantEncoderConfig;
  },
) =>
  pipe(
    Dispatcher.Default,
    L.provideMerge(Rehydrator.config(config.register)),
    L.provideMerge(RehydrantDOM.Fresh),
    L.provideMerge(RehydrantEncoder.config(config.encoding ?? {})),
  );
