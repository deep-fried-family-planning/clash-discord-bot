import {GlobalValue} from 'effect';
import * as E from 'effect/Effect';

export const mutex = GlobalValue
  .globalValue(
    Symbol.for('disreact/mutex'),
    () => E.unsafeMakeSemaphore(1),
  );

export const lock = mutex.take(1);

export const done = mutex.release(1);
