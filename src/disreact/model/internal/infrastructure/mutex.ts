import type * as Element from '#src/disreact/model/entity/domain/element.ts';
import type * as Rehydrant from '#src/disreact/model/entity/envelope.ts';
import * as Globals from '#src/disreact/model/infrastructure/global.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import {globalValue} from 'effect/GlobalValue';

export type mutex = never;

const mutex = globalValue(Symbol.for('disreact/mutex'), () => E.unsafeMakeSemaphore(1));

const lock = mutex.take(1);

const unlock = pipe(
  E.sync(Globals.reset),
  E.andThen(mutex.release(1)),
);

const tap = E.tap(unlock);

const tapDefect = E.tapDefect(() => unlock);

export const acquire = (n: Element.Func, rh: Rehydrant.Envelope) =>
  E.map(lock, () => {
    Globals.set(rh, n);
    return n;
  });

export const release = <A, E, R>(n: Element.Func, rh: Rehydrant.Envelope) => (effect: E.Effect<A, E, R>) =>
  effect.pipe(
    tap,
    tapDefect,
  );
