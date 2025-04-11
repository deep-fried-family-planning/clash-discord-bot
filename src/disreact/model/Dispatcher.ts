import {E, pipe} from '#src/disreact/utils/re-exports.ts';
import {FiberMap, FiberSet} from 'effect';
import type { Fibril } from './entity/fibril';
import {Hooks} from './hooks';

export declare namespace Dispatcher {
  export type Key = string;
}

const CALLER = {current: undefined as undefined | Fibril};

const SINGLETON = {current: null as unknown as Fibril};

export class Dispatcher extends E.Service<Dispatcher>()('disreact/Dispatcher', {
  effect: pipe(
    E.all({
      mutex: E.makeSemaphore(1),
    }),
    E.map(({mutex}) =>
      ({
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
