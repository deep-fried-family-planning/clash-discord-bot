import type {Rehydrant} from '#src/disreact/model/entity/rehydrant.ts';
import {E, pipe} from '#src/disreact/utils/re-exports.ts';
import {FiberMap, FiberSet} from 'effect';
import {Hooks} from './hooks';

export declare namespace Dispatcher {
  export type Key = string;
}


export class Dispatcher extends E.Service<Dispatcher>()('disreact/Dispatcher', {
  effect: pipe(
    E.all({
      mutex: E.makeSemaphore(1),
      // roots: FiberMap.make<Dispatcher.Key, Rehydrant>(),
      // roots: FiberSet.make<Dispatcher.Key, Rehydrant>(),
    }),
    E.map(({mutex}) =>
      ({
        // roots,
        // mutex,
        lock  : mutex.take(1),
        unlock: mutex.release(1),
      }),
    ),
  ),
}) {
  static readonly impl = {
    useState  : Hooks.$useState,
    useReducer: Hooks.$useReducer,
    useEffect : Hooks.$useEffect,
    usePage   : Hooks.$usePage,
    useIx     : Hooks.$useIx,
  };
}
