import * as Record from 'effect/Record';
import * as Data from 'effect/Data';

export const purgeUndefinedKeys = <A extends Record<string, any>>(obj: A): A =>
  Record.filter(obj, (v) => v !== undefined) as A;

export const unsafeDeepHash = <A>(data: A): A => {
  if (!data || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    const ds = Array(data.length);

    for (let i = 0; i < data.length; i++) {
      ds[i] = unsafeDeepHash(data[i]);
    }
    return Data.array(ds) as A;
  }
  return Data.struct(Record.map(purgeUndefinedKeys(data), unsafeDeepHash)) as A;
};
