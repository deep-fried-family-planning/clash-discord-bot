import * as E from 'effect/Effect';
import * as Predicate from 'effect/Predicate';
import * as Prototype from '#src/disreact/model/internal/infrastructure/proto.ts';
/* eslint-disable @typescript-eslint/no-unsafe-function-type */

export type Event = {
  id       : string;
  attribute: string;
  data     : any;
};

export const make = (
  id: string,
  attribute: string,
  data: any,
): Event =>
  ({
    id       : id,
    attribute: attribute,
    data     : data,
  });

export interface Handler<E, R> extends Function {
  (event: any): | void
                | Promise<void>
                | E.Effect<void, E, R>;
}
type AnyHandler = Handler<any, any>;

export const handle = (h: AnyHandler, e: Event): E.Effect<void> => E.suspend(() => {
  if (Prototype.isAsync(h)) {
    return E.promise(() => h(e));
  }
  const out = h(e);

  if (Predicate.isPromise(out)) {
    return E.promise(() => out);
  }
  if (E.isEffect(out)) {
    return out as E.Effect<void>;
  }
  return E.void;
});
