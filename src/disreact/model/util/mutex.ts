import type * as Element from '#src/disreact/model/entity/element.ts';
import * as Globals from '#src/disreact/model/entity/globals.ts';
import type * as Rehydrant from '#src/disreact/model/entity/rehydrant.ts';
import * as E from 'effect/Effect';
import * as GlobalValue from 'effect/GlobalValue';

export type Mutex = never;

export const mutex = GlobalValue.globalValue(Symbol.for('disreact/mutex'), () =>
  E.unsafeMakeSemaphore(1),
);

export const lock   = mutex.take(1),
             unlock = mutex.release(1);

export const acquire = (rh: Rehydrant.Rehydrant, n: Element.Component) =>
  lock.pipe(
    E.andThen(
      E.sync(() => Globals.set(rh, n)),
    ),
  );

const releaseSync = E.sync(() => Globals.reset());

export const release = () =>
  releaseSync.pipe(
    E.andThen(unlock),
  );
