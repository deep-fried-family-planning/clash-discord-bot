import type {HookError} from '#src/disreact/codec/error.ts';
import {FiberNode} from '#src/disreact/model/hooks/fiber-node.ts';
import {FiberStore} from '#src/disreact/model/hooks/fiber-store.ts';
import {$useEffect} from '#src/disreact/model/hooks/use-effect.ts';
import {$useReducer, $useState} from '#src/disreact/model/hooks/use-reducer.ts';
import {$useIx, $useMessage} from '#src/disreact/model/hooks/use-utility.ts';
import {E, L} from '#src/internal/pure/effect.ts';
import {Logger, LogLevel, pipe} from 'effect';



export class HookDispatch extends E.Service<HookDispatch>()('disreact/HookDispatch', {
  accessors: true,

  effect: E.makeSemaphore(1).pipe(
    E.map((semaphore) => {
      return {
        mutex: (node: FiberNode) => <A, E, R>(effect: E.Effect<A, E, R>) =>
          pipe(
            E.sync(() => {
              FiberNode.λ_λ.set(node);
              FiberStore.λ_λ.set(node.root as any);
            }),
            E.andThen(() => effect),
            E.catchAll((e) => {
              FiberNode.λ_λ.clear();
              FiberStore.λ_λ.clear();
              return E.fail(e as HookError);
            }),
            semaphore.withPermits(1),
            // E.withLogSpan('mutex'),
            // E.tap(() => E.log('mutex')),
            // E.provide(Logger.minimumLogLevel(LogLevel.Fatal)),
            // E.provide(
            //   Logger.replace(Logger.defaultLogger, Logger.prettyLoggerDefault),
            // ),
            // E.provide([
            //   L.setTracerTiming(true),
            //   L.setTracerEnabled(true),
            // ]),
          ),
      };
    }),
  ),
}) {
  static readonly withMutex = (node: FiberNode) => <A, E, R>(effect: E.Effect<A, E, R>) =>
    pipe(
      HookDispatch.use((dispatch) =>
        pipe(
          effect,
          dispatch.mutex(node),
        ),
      ),
      E.provide(HookDispatch.Default),
    );

  static readonly impl = {
    useState  : $useState,
    useReducer: $useReducer,
    useEffect : $useEffect,
    usePage   : $useMessage,
    useIx     : $useIx,
  };
}

// const thing = HookDispatcher.pipe(E.map((hookDispatcher) => {
//   hookDispatcher.mutex();
// }));

// const thing = E.gen(function* () {
//   const thing2 = yield* HookDispatch.mutex();
//
//   yield* thing2(E.void);
// });


//
// export class HookDispatcher extends E.Tag(HOOK_DISPATCHER_TAG)<
//   HookDispatcher,
//   {
//     mutex: () => <A, E, R>(node: FiberNode.T, effect: E.Effect<A, E, R>) => E.Effect<A, E, R>;
//   }
// >() {
//   static readonly Live       = L.effect(this, E.suspend(() => make));
//   static readonly useState   = UseState.hook;
//   static readonly useReducer = UseReducer.hook;
//   static readonly useEffect  = UseEffect.hook;
//   static readonly usePage    = UsePage.hook;
//   static readonly useIx      = UseIx.hook;
// }
