import type {Fibril} from '#src/disreact/model/entity/fibril.ts';
import {E, pipe} from '#src/disreact/utils/re-exports.ts';

const MODE = {current: null as 1 | null};

const GLOBAL = {current: null as Fibril | null};

const setGlobal = (fiber: Fibril | null) => {
  GLOBAL.current = fiber;
};

const getGlobal = () => {
  if (!GLOBAL.current) {
    throw new Error();
  }
  return GLOBAL.current;
};

export class HooksDispatcher extends E.Service<HooksDispatcher>()('disreact/HooksDispatcher', {
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
  static readonly setGlobal = setGlobal;
  static readonly getGlobal = getGlobal;
}
