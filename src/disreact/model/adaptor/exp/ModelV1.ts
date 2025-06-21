import type * as FC from '#src/disreact/model/internal/domain/fc.ts';
import * as Rehydrant from '#src/disreact/model/adaptor/exp/domain/old/envelope.ts';
import * as Lifecycle from '#src/disreact/model/adaptor/exp/v1lifecycle.ts';
import {Rehydrator, type RehydratorConfig} from '#src/disreact/model/adaptor/exp/Rehydrator.ts';
import {Relay} from '#src/disreact/model/adaptor/exp/Relay.ts';
import * as Progress from '#src/disreact/codec/old/progress2.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import type * as El from '#src/disreact/model/adaptor/exp/domain/old/element.ts';
import * as L from 'effect/Layer';

export const synthesizeRoot = (source: FC.FC, props?: any, data?: any) =>
  pipe(
    Lifecycle.init__(Rehydrant.fromFC(source, props, data)),
    E.flatMap((root) => Lifecycle.encode(root)),
  );

export const registerRoot = (source: Rehydrant.Registrant) =>
  Rehydrator.register(source);

export const createRoot = (source: Rehydrant.SourceId, props?: any, data?: any) =>
  pipe(
    Rehydrator.checkout(source, props, data),
    E.flatMap((root) => Lifecycle.init__(root)),
    E.flatMap((root) => Lifecycle.encode(root)),
  );

export const invokeRoot = (hydrator: Rehydrant.Hydrator, event: El.Event, data?: any) =>
  pipe(
    Rehydrator.rehydrate(hydrator, data),
    E.flatMap((root) => Lifecycle.rehydrate__(root)),
    E.flatMap((root) => Lifecycle.invoke2(root, event)),
    E.flatMap((root) => Lifecycle.rerenders(root)),
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
        E.flatMap((root) => Lifecycle.init__(root)),
      );
    }),
    E.tap(Relay.end),
    E.flatMap((root) => Lifecycle.encode(root)),
  );

export class ModelV1 extends E.Service<ModelV1>()('disreact/Model', {
  effect: E.gen(function* () {
    const rehydrator = yield* Rehydrator;

    const synthesizeRoot = (source: FC.FC, props?: any, data?: any) =>
      pipe(
        Lifecycle.init__(Rehydrant.fromFC(source, props, data)),
        E.flatMap((root) => Lifecycle.encode(root)),
      );

    const registerRoot = rehydrator.register;

    const createRoot = (source: Rehydrant.SourceId, props?: any, data?: any) =>
      pipe(
        rehydrator.checkout(source, props, data),
        E.flatMap((root) => Lifecycle.init__(root)),
        E.flatMap((root) => Lifecycle.encode(root)),
      );

    const invokeRoot = (hydrator: Rehydrant.Hydrator, event: El.Event, data?: any) =>
      Relay.use((relay) =>
        pipe(
          rehydrator.rehydrate(hydrator, data),
          E.flatMap((root) => Lifecycle.rehydrate__(root)),
          E.flatMap((root) => Lifecycle.invoke2(root, event)),
          E.flatMap((root) => Lifecycle.rerenders(root)),
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
              E.flatMap((root) => Lifecycle.init__(root)),
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
