import type {FC} from '#src/disreact/model/entity/fc.ts';
import * as Rehydrant from '#src/disreact/model/entity/rehydrant.ts';
import * as Lifecycle from '#src/disreact/model/lifecycle/lifecycle.ts';
import {Rehydrator, type RehydratorConfig} from '#src/disreact/model/Rehydrator.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import * as Progress from '#src/disreact/model/util/progress.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import type * as El from '#src/disreact/model/entity/element.ts';
import * as L from 'effect/Layer';

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
    E.tapError((error) => Relay.fail(error)),
    E.fork,
    E.andThen(Relay.await),
    E.flatMap((out) => {
      if (Progress.isExit(out)) {
        return E.succeed(null);
      }
      if (Progress.isSame(out)) {
        return E.succeed(out);
      }
      return pipe(
        Rehydrator.checkout(out.id!, out.props, out.data),
        E.flatMap((root) => Lifecycle.initialize(root)),
      );
    }),
    E.tap(Relay.end),
    E.flatMap((root) => Lifecycle.encode(root)),
  );

export class Model extends E.Service<Model>()('disreact/Model', {
  effect: E.gen(function* () {
    const rehydrator = yield* Rehydrator;

    const synthesizeRoot = (source: FC.FC, props?: any, data?: any) =>
      pipe(
        Lifecycle.initialize(Rehydrant.fromFC(source, props, data)),
        E.flatMap((root) => Lifecycle.encode(root)),
      );

    const registerRoot = rehydrator.register;

    const createRoot = (source: Rehydrant.SourceId, props?: any, data?: any) =>
      pipe(
        rehydrator.checkout(source, props, data),
        E.flatMap((root) => Lifecycle.initialize(root)),
        E.flatMap((root) => Lifecycle.encode(root)),
      );

    const invokeRoot = (hydrator: Rehydrant.Hydrator, event: El.Event, data?: any) =>
      Relay.use((relay) =>
        pipe(
          rehydrator.decode(hydrator, data),
          E.flatMap((root) => Lifecycle.rehydrate(root)),
          E.flatMap((root) => Lifecycle.invoke(root, event)),
          E.flatMap((root) => Lifecycle.rerender(root)),
          E.tapError((error) => relay.fail(error)),
          E.fork,
          E.andThen(relay.await),
          E.flatMap((out) => {
            if (Progress.isExit(out)) {
              return E.succeed(null);
            }
            if (Progress.isSame(out)) {
              return E.succeed(out);
            }
            return pipe(
              rehydrator.checkout(out.id, out.props, out.data),
              E.flatMap((root) => Lifecycle.initialize(root)),
            );
          }),
          E.tap(relay.end),
          E.flatMap((root) =>
            Lifecycle.encode(root),
          ),
        ),
      );

    return {
      synthesizeRoot,
      registerRoot,
      createRoot,
      invokeRoot,
    };
  }),
  dependencies: [
    Rehydrator.Default(),
  ],
  accessors: true,
}) {
  static readonly layer = (config: RehydratorConfig) =>
    pipe(
      this.DefaultWithoutDependencies,
      L.provideMerge(Rehydrator.Default(config)),
    );
}
