import type * as Element from '#src/disreact/adaptor/adaptor/element.ts';
import type * as Rehydrant from '#src/disreact/adaptor/adaptor/envelope.ts';
import * as current from '#src/disreact/adaptor/adaptor/global.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import {globalValue} from 'effect/GlobalValue';

export type mutex = never;

const mutex = globalValue(Symbol.for('disreact/mutex'), () => E.unsafeMakeSemaphore(1));

export const lock = mutex.take(1);

const unlock = pipe(
  E.sync(current.reset),
  E.andThen(mutex.release(1)),
);

export const tap = E.tap(unlock);

export const tapDefect = E.tapDefect(() => unlock);

export const acquire2 = (n: Element.Func, rh: Rehydrant.Envelope) =>
  E.map(lock, () => {
    current.setV1(rh, n);
    return n;
  });

export const release2 = <A, E, R>(n: Element.Func, rh: Rehydrant.Envelope) => (effect: E.Effect<A, E, R>) =>
  effect.pipe(
    tap,
    tapDefect,
  );
