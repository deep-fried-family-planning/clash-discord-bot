import type * as E from 'effect/Effect';
import * as S from 'effect/Schema';

export type Handler<A> = (event: A) =>
      | void
      | Promise<void>
      | E.Effect<void, any, any>;

const handler = <A>(h: unknown): h is (event: A) => void | Promise<void> | E.Effect<void, any, any> =>
      typeof h === 'function' &&
      h.length <= 1;

export const Handler = <A, I, R>(data: S.Schema<A, I, R>) =>
  S.declare(
    handler<typeof data.Type>,
  );

export const isHandler = S.is(Handler(S.Any));

export const Attributes = <A extends S.Struct.Fields>(fields: A) =>
  S.Struct(
    fields,
  );

export const Event = {};

export interface Encodable<
  T extends string = string,
  P = any,
  A extends Record<string, any> = Record<string, any>,
> {
  type : T;
  props: P;
  acc  : {
    [K in keyof A]?: A[K][]
  };
}

export const ControlledId = S.TemplateLiteralParser(
  S.String,
  '.', S.NumberFromString,
  '.', S.String,
  '.', S.NumberFromString,
);

export const isControlledId = S.is(ControlledId);
