import {Elem} from '#src/disreact/model/elem/elem.ts';
import {FC} from '#src/disreact/model/elem/fc.ts';
import {Fibril} from '#src/disreact/model/meta/fibril.ts';
import type {Rehydrant} from '#src/disreact/model/meta/rehydrant.ts';
import {Effect, pipe} from 'effect';
import {Hooks} from './hooks';

const mount = (mutex: Effect.Semaphore) => (root: Rehydrant, elem: Elem.Task) =>
  pipe(
    mutex.take(1),
    Effect.flatMap(() => {
      root.fibrils[elem.id!] = elem.fibril;
      elem.fibril.elem = elem;
      elem.fibril.rehydrant = root;
      elem.fibril.pc = 0;
      elem.fibril.rc = 0;
      Hooks.setup(elem.fibril);

      return FC.render(elem.type, elem.props);
    }),
    Effect.flatMap((children) => {
      Hooks.setup(undefined);
      Fibril.commit(elem.fibril);
      return pipe(
        mutex.release(1),
        Effect.as(Elem.connectChildren(elem, children)),
      );
    }),
    Effect.catchAllDefect((e) => {
      Hooks.setup(undefined);

      return Effect.zipRight(
        mutex.release(1),
        Effect.fail(e as Error),
      );
    }),
  );

const hydrate = (mutex: Effect.Semaphore) => (root: Rehydrant, elem: Elem.Task) =>
  pipe(
    mutex.take(1),
    Effect.flatMap(() => {
      root.fibrils[elem.id!] = elem.fibril;
      elem.fibril.elem = elem;
      elem.fibril.rehydrant = root;
      elem.fibril.pc = 0;
      elem.fibril.rc = 1;
      Hooks.setup(elem.fibril);

      return FC.render(elem.type, elem.props);
    }),
    Effect.flatMap((children) => {
      Hooks.setup(undefined);
      Fibril.commit(elem.fibril);

      return pipe(
        mutex.release(1),
        Effect.as(Elem.connectChildren(elem, children)),
      );
    }),
    Effect.catchAllDefect((e) => {
      Hooks.setup(undefined);

      return pipe(
        mutex.release(1),
        Effect.andThen(() => Effect.fail(e as Error)),
      );
    }),
  );

const render = (mutex: Effect.Semaphore) => (root: Rehydrant, elem: Elem.Task) =>
  pipe(
    mutex.take(1),
    Effect.flatMap(() => {
      root.fibrils[elem.id!] = elem.fibril;
      elem.fibril.elem = elem;
      elem.fibril.rehydrant = root;
      elem.fibril.pc = 0;
      Hooks.setup(elem.fibril);

      return FC.render(elem.type, elem.props);
    }),
    Effect.flatMap((children) => {
      Hooks.setup(undefined);
      Fibril.commit(elem.fibril);

      return Effect.as(
        mutex.release(1),
        Elem.connectChildren(elem, children),
      );
    }),
    Effect.catchAllDefect((e) => {
      Hooks.setup(undefined);

      return pipe(
        mutex.release(1),
        Effect.andThen(() => Effect.fail(e as Error)),
      );
    }),
  );

export class Dispatcher extends Effect.Service<Dispatcher>()('disreact/Dispatcher', {
  effect: Effect.map(Effect.makeSemaphore(1), (mutex) => ({
    lock   : mutex.take(1),
    unlock : mutex.release(1),
    render : render(mutex),
    hydrate: hydrate(mutex),
    mount  : mount(mutex),
    mutex,
  })),
  accessors: true,
}) {}
