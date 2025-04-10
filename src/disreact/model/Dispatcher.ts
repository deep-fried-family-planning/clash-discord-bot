import {E, pipe} from '#src/disreact/utils/re-exports.ts';
import {Hooks} from './hooks';

export class Dispatcher extends E.Service<Dispatcher>()('disreact/Dispatcher', {
  effect: pipe(
    E.all({
      mutex: E.makeSemaphore(1),
    }),
    E.map(({mutex}) =>
      ({
        mutex,
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
