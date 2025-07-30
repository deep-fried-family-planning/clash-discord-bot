import * as Record from 'effect/Record';

export const purgeUndefinedKeys = <A extends Record<string, any>>(obj: A): A =>
  Record.filter(obj, (v) => v !== undefined) as A;
