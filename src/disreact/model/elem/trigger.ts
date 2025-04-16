import {Elem} from '#src/disreact/model/elem/elem.ts';
import {D, E, pipe, S} from '#src/disreact/utils/re-exports.ts';
import {Predicate} from 'effect';

export * as Trigger from '#src/disreact/model/elem/trigger.ts';
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

export type Handler<A, E = any, R = any> = (event: Event<A>) =>
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

export const isTarget = (event: Trigger, elem: Elem): elem is Elem.Rest => {
  if (Elem.isRest(elem)) {
    if (elem.props.custom_id === event.id || elem.ids === event.id) {
      return true;
    }
  }
  return false;
};

export const apply = <A = any>(handler: Handler<A>, event: Trigger<A>) =>
  pipe(
    E.sync(() => handler(event.data)),
    E.flatMap((output) => {
      if (Predicate.isPromise(output)) {
        return E.promise(async () => await output);
      }

      if (E.isEffect(output)) {
        return output as E.Effect<void>;
      }

      return E.void;
    }),
    E.catchAllDefect((e) => E.fail(e as Error)),
  );
