import {D, E, pipe, S} from '#src/disreact/utils/re-exports.ts';
import {Predicate} from 'effect';

export * as Trigger from '#src/disreact/model/entity/trigger.ts';
export type Trigger<A = any> = {
  id  : string;
  data: A;
};

export const make = (id: string, data: any): Trigger => ({
  id,
  data,
});

export const declare = <A, I, R>(data: S.Schema<A, I, R>) =>
  S.Struct({
    id  : S.String,
    data: data,
  });

export type Event<A> = Trigger<A>['data'];

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

export class TriggerDefect extends D.TaggedError('disreact/TriggerDefect')<{
  cause: unknown;
}> {}

export const apply = <A = any>(handler: Handler<A>, event: Trigger<A>) =>
  pipe(
    E.try({
      try  : () => handler(event.data),
      catch: (e) => new TriggerDefect({cause: e}),
    }),
    E.flatMap((output) => {
      if (Predicate.isPromise(output)) {
        return E.tryPromise({
          try  : async () => await output,
          catch: (e) => new TriggerDefect({cause: e}),
        });
      }

      if (E.isEffect(output)) {
        return pipe(
          output as E.Effect<void>,
          E.catchAll((e) => new TriggerDefect({cause: e})),
        );
      }

      return E.void;
    }),
  );
