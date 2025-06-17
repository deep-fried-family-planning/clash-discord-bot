import type * as Element from '#src/disreact/model/internal/element.ts';
import * as Globals from '#src/disreact/model/internal/infrastructure/globals.ts';
import type * as Rehydrant from '#src/disreact/model/internal/rehydrant.ts';
import * as E from 'effect/Effect';
import * as GlobalValue from 'effect/GlobalValue';

export type Mutex = never;

export const mutex = GlobalValue.globalValue(Symbol.for('disreact/mutex'), () =>
  E.unsafeMakeSemaphore(1),
);

export const lock   = mutex.take(1),
             unlock = mutex.release(1);

export const acquire = (rh: Rehydrant.Envelope, n: Element.Instance) =>
  lock.pipe(
    E.andThen(
      E.sync(() => Globals.set(rh, n)),
    ),
  );

const resetTap = E.sync(Globals.reset).pipe(
  E.andThen(unlock),
);

const resetDefect = () => {
  Globals.reset();
  return unlock;
};

const reset = E.sync(() => Globals.reset()).pipe(
  E.andThen(unlock),
);

export const release = <A, E, R>(rh: Rehydrant.Envelope, n: Element.Instance) => (effect: E.Effect<R, E, A>) =>
  effect.pipe(
    E.tap(reset),
    E.tapDefect(resetDefect),
  );
