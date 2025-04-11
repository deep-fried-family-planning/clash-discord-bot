import {D, E, pipe, S} from '#src/disreact/utils/re-exports.ts';
import type {Cause} from 'effect';
import {Predicate} from 'effect';

export const TypeId = Symbol('disreact/Trigger');

export class TriggerDefect extends D.TaggedError('disreact/TriggerDefect')<{
  message?: string;
  cause?  : unknown;
}> {}

export * as Trigger from '#src/disreact/model/entity/trigger.ts';
export type Trigger<A = any> = {
  id      : string;
  data    : A;
  [TypeId]: typeof TypeId;
};

export const make = (id: string, data: any): Trigger =>
  ({
    [TypeId]: TypeId,
    id,
    data,
  });

export const declare = <A, I, R>(data: S.Schema<A, I, R>) =>
  S.Struct({
    id  : S.String,
    data: data,
  });

export type Event<A> = Trigger<A>['data'];

export const HandlerTypeId = Symbol('disreact/Trigger/Handler');

export type Handler<A> = <E, R>(event: Event<A>) =>
  | void
  | Promise<void>
  | E.Effect<void, E, R>;

const isHandler = <A>(h: unknown): h is Handler<A> =>
  typeof h === 'function';

export const declareHandler = <A, I, R>(data: S.Schema<A, I, R>) =>
  S.declare(
    isHandler<typeof data.Type>,
  );

export const apply = <A = any>(handler: Handler<A>, event: Trigger<A>) =>
  pipe(
    E.try({
      try  : () => handler(event.data),
      catch: (e) => new TriggerDefect({
        message: 'Handler threw an exception',
        cause  : e,
      }),
    }),
    E.flatMap((output) => {
      if (!output) {
        return E.void;
      }

      if (E.isEffect(output)) {
        return output as E.Effect<void>;
      }

      if (Predicate.isPromise(output)) {
        return E.tryPromise({
          try  : () => output,
          catch: (e) => new TriggerDefect({
            message: 'Handler threw an exception',
            cause  : e,
          }),
        });
      }

      return E.fail(
        new TriggerDefect({
          message: 'Invalid handler output',
        }),
      ) as E.Effect<void, Cause.UnknownException | TriggerDefect>;
    }),
  );
