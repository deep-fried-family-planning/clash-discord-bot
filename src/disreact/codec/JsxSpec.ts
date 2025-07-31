import type * as E from 'effect/Effect';
import * as S from 'effect/Schema';

export const Attributes = <A extends S.Struct.Fields>(fields: A) =>
  S.Struct(fields);

export const Event = {};

export const Handler = <A, I, R>(data: S.Schema<A, I, R>) =>
  S.declare(
    (h): h is (event: typeof data.Type) =>
      | void
      | Promise<void>
      | E.Effect<void, any, any> =>
      typeof h === 'function' &&
      h.length <= 1,
  );
