import type * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as S from 'effect/Schema';

export const Attributes = <F extends S.Struct.Fields>(fields: F) =>
  S.mutable(
    S.Struct(fields),
  );

export const Handler = <A, I, R>(data: S.Schema<A, I, R>) =>
  S.declare(
    (h): h is (event: typeof data.Type) =>
      | void
      | Promise<void>
      | E.Effect<void, any, any> =>
      typeof h === 'function' &&
      h.length === 1,
  );
