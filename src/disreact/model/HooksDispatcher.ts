import {E} from '#src/disreact/utils/re-exports.ts';
import {Hooks} from './hooks';

const makeSemaphore = E.makeSemaphore(1);

export class HooksDispatcher extends E.Service<HooksDispatcher>()('disreact/Dispatcher', {
  effect: E.map(makeSemaphore, (semaphore) =>
    ({
      lock  : semaphore.take(1),
      unlock: semaphore.release(1),
    }),
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
