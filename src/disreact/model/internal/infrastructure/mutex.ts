import type * as Element from '#src/disreact/model/internal/core/element.ts';
import * as Globals from '#src/disreact/model/internal/infrastructure/global.ts';
import type * as Rehydrant from '#src/disreact/model/internal/rehydrant.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as GlobalValue from 'effect/GlobalValue';

export type Mutex = never;

const mutex = GlobalValue.globalValue(
  Symbol.for('disreact/mutex'),
  () => E.unsafeMakeSemaphore(1),
);

const lock = mutex.take(1);

const unlock = pipe(
  E.sync(Globals.reset),
  E.andThen(mutex.release(1)),
);

const tap = E.tap(unlock);

const tapDefect = E.tapDefect(() => unlock);

export const acquire = (n: Element.Func, rh: Rehydrant.Envelope) =>
  pipe(
    lock,
    E.map(() => {
      Globals.set(rh, n);
      return n;
    }),
  );

export const release = <A, E, R>(n: Element.Func, rh: Rehydrant.Envelope) => (effect: E.Effect<A, E, R>) =>
  pipe(
    effect,
    tap,
    tapDefect,
  );
