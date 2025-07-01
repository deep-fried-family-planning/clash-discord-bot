import * as E from 'effect/Effect';

export type Effect<E = never, R = never> =
  | (() => void)
  | (() => Promise<void>)
  | (E.Effect<void, E, R>);
