import type {FC} from '#src/disreact/model/entity/fc.ts';
import * as Rehydrant from '#src/disreact/model/entity/rehydrant.ts';
import * as Lifecycle from '#src/disreact/model/lifecycle.ts';
import {RehydrantDOM} from '#src/disreact/model/RehydrantDOM.ts';
import {Rehydrator} from '#src/disreact/model/Rehydrator.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import type * as El from 'src/disreact/model/entity/el.ts';

export namespace Model {}

export const synthesizeRoot = (source: FC.FC, props?: any, data?: any) =>
  pipe(
    Lifecycle.initialize(Rehydrant.fromFC(source, props, data)),
    E.flatMap((root) => Lifecycle.encode(root)),
  );

export const registerRoot = (source: Rehydrant.Registrant, id?: string) =>
  Rehydrator.register(source, id);

export const createRoot = (source: Rehydrant.SourceId, props?: any, data?: any) =>
  pipe(
    Rehydrator.checkout(source, props, data),
    E.flatMap((root) => Lifecycle.initialize(root)),
    E.flatMap((root) => Lifecycle.encode(root)),
  );

export const invokeRoot = (hydrator: Rehydrant.Hydrator, event: El.Event, data?: any) =>
  pipe(
    Rehydrator.decode(hydrator, data),
    E.flatMap((root) => Lifecycle.rehydrate(root)),
    E.flatMap((root) => Lifecycle.invoke(root, event)),
    E.flatMap((root) => Lifecycle.rerender(root)),
    E.tapError((error) => RehydrantDOM.fail(error)),
    E.fork,
    E.andThen(RehydrantDOM.output()),
    E.flatMap((output) => {
      if (output === null) {
        return E.succeed(null);
      }
      if (output.id === hydrator.id) {
        return E.succeed(output);
      }
      return Lifecycle.initialize(output);
    }),
    E.tap(RehydrantDOM.complete),
    E.flatMap((root) => Lifecycle.encode(root)),
  );
