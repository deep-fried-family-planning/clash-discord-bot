import {RehydrantDOM} from '#src/disreact/mode/RehydrantDOM.ts';
import {Rehydrator, type RehydratorConfig} from '#src/disreact/mode/Rehydrator.ts';
import * as Rehydrant from '#src/disreact/mode/entity/rehydrant.ts';
import * as E from 'effect/Effect';
import * as L from 'effect/Layer';
import {pipe} from 'effect/Function';
import * as Lifecycle from './lifecycle.ts';
import type * as El from './entity/el.ts';

export const synthesizeRoot = (source: Rehydrant.Registrant, props?: any, data?: any) =>
  pipe(
    Rehydrant.fromSource(Rehydrant.source(source), props, data),
    Lifecycle.initialize,
    E.flatMap((root) => Rehydrator.encode(root)),
  );

export const registerRoot = (source: Rehydrant.Registrant, id?: string) =>
  Rehydrator.register(source, id);

export const createRoot = (source: Rehydrant.SourceId, props?: any, data?: any) =>
  pipe(
    Rehydrator.checkout(source, props, data),
    E.flatMap((root) => Lifecycle.initialize(root)),
    E.flatMap((root) => Rehydrator.encode(root)),
  );

export const invokeRoot = (hydrator: Rehydrant.Hydrator, event: El.Event, data?: any) =>
  pipe(
    Rehydrator.decode(hydrator, data),
    E.flatMap((root) => Lifecycle.rehydrate(root)),
    E.flatMap((root) => Lifecycle.invoke(root, event)),
    E.flatMap((root) => Lifecycle.rerender(root)),
    E.zipRight(RehydrantDOM.output(), {concurrent: true}),
    E.flatMap((output) => {
      if (output === null) {
        return E.succeed(null);
      }
      if (output.id === hydrator.id) {
        return E.succeed(output);
      }
      return Lifecycle.initialize(output);
    }),
    E.flatMap((root) => Rehydrator.encode(root)),
  );
