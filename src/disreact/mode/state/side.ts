import * as E from 'effect/Effect';
import * as P from 'effect/Predicate';

export declare namespace Side {
  export type Effect = () => void | Promise<void> | E.Effect<void, any, any>;
}
export type Side = Side.Effect;

export const flush = (side: Side.Effect) => {
  const out = side();
  if (P.isPromise(out)) return E.promise(async () => await out);
  if (E.isEffect(out)) return out as E.Effect<void>;
  return E.void;
};
