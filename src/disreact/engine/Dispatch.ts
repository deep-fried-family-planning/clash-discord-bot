import * as Effect from 'effect/Effect';

const mutex   = Effect.unsafeMakeSemaphore(1),
      acquire = mutex.take(1),
      release = mutex.release(1);

export const render = () => {};

export const effects = () => {};

export const event = () => {};
