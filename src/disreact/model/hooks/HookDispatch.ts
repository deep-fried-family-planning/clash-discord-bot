import type {HookError} from '#src/disreact/codec/error.ts';
import {FiberNode} from '#src/disreact/model/entity/fiber-node.ts';
import {$useEffect} from '#src/disreact/model/hooks/use-effect.ts';
import {$useReducer, $useState} from '#src/disreact/model/hooks/use-reducer.ts';
import {$useIx, $useMessage} from '#src/disreact/model/hooks/use-utility.ts';
import {E} from '#src/internal/pure/effect.ts';
import {pipe} from 'effect';



export class HookDispatch extends E.Service<HookDispatch>()('disreact/HookDispatch', {
  accessors: true,

  effect: E.makeSemaphore(1).pipe(
    E.map((semaphore) => {
      return {
        mutex: (node: FiberNode) => <A, E, R>(effect: E.Effect<A, E, R>) =>
          pipe(
            E.sync(() => {
              FiberNode.λ_λ.set(node);
            }),
            E.andThen(() => effect),
            E.catchAll((e) => {
              FiberNode.λ_λ.clear();
              return E.fail(e as HookError);
            }),
            semaphore.withPermits(1),
          ),
      };
    }),
  ),
}) {
  static readonly withMutex = (node: FiberNode) => <A, E, R>(effect: E.Effect<A, E, R>) =>
    pipe(
      HookDispatch.use((dispatch) => dispatch.mutex(node)(effect)),
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
