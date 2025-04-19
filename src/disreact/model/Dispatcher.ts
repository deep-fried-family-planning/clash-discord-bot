import {Elem} from '#src/disreact/model/elem/elem.ts';
import {FC} from '#src/disreact/model/elem/fc.ts';
import {Fibril} from '#src/disreact/model/meta/fibril.ts';
import type {Rehydrant} from '#src/disreact/model/meta/rehydrant.ts';
import {E, pipe} from '#src/disreact/utils/re-exports.ts';
import {Hooks} from './hooks';

const mount = (mutex: E.Semaphore) => (root: Rehydrant, elem: Elem.Task) =>
  pipe(
    mutex.take(1),
    E.flatMap(() => {
      root.fibrils[elem.id!] = elem.fibril;
      elem.fibril.elem = elem;
      elem.fibril.rehydrant = root;
      elem.fibril.pc = 0;
      elem.fibril.rc = 0;
      Hooks.setup(elem.fibril);

      return FC.render(elem.type, elem.props);
    }),
    E.flatMap((children) => {
      Hooks.setup(undefined);
      Fibril.commit(elem.fibril);
      return pipe(
        mutex.release(1),
        E.as(Elem.connectChildren(elem, children)),
      );
    }),
    E.catchAllDefect((e) => {
      Hooks.setup(undefined);

      return E.zipRight(
        mutex.release(1),
        E.fail(e as Error),
      );
    }),
  );

const hydrate = (mutex: E.Semaphore) => (root: Rehydrant, elem: Elem.Task) =>
  pipe(
    mutex.take(1),
    E.flatMap(() => {
      root.fibrils[elem.id!] = elem.fibril;
      elem.fibril.elem = elem;
      elem.fibril.rehydrant = root;
      elem.fibril.pc = 0;
      elem.fibril.rc = 1;
      Hooks.setup(elem.fibril);

      return FC.render(elem.type, elem.props);
    }),
    E.flatMap((children) => {
      Hooks.setup(undefined);
      Fibril.commit(elem.fibril);

      return pipe(
        mutex.release(1),
        E.as(Elem.connectChildren(elem, children)),
      );
    }),
    E.catchAllDefect((e) => {
      Hooks.setup(undefined);

      return pipe(
        mutex.release(1),
        E.andThen(() => E.fail(e as Error)),
      );
    }),
  );

const render = (mutex: E.Semaphore) => (root: Rehydrant, elem: Elem.Task) =>
  pipe(
    mutex.take(1),
    E.flatMap(() => {
      root.fibrils[elem.id!] = elem.fibril;
      elem.fibril.elem = elem;
      elem.fibril.rehydrant = root;
      elem.fibril.pc = 0;
      Hooks.setup(elem.fibril);

      return FC.render(elem.type, elem.props);
    }),
    E.flatMap((children) => {
      Hooks.setup(undefined);
      Fibril.commit(elem.fibril);

      return E.as(
        mutex.release(1),
        Elem.connectChildren(elem, children),
      );
    }),
    E.catchAllDefect((e) => {
      Hooks.setup(undefined);

      return pipe(
        mutex.release(1),
        E.andThen(() => E.fail(e as Error)),
      );
    }),
  );

export class Dispatcher extends E.Service<Dispatcher>()('disreact/Dispatcher', {

  effect: E.map(E.makeSemaphore(1), (mutex) => ({
    lock  : mutex.take(1),
    unlock: mutex.release(1),

    render : render(mutex),
    hydrate: hydrate(mutex),
    mount  : mount(mutex),

    mutex,

    doRender: () =>
      pipe(
        mutex.take(1),
      ),
  })),

  accessors: true,
}) {}
