import * as Data from 'effect/Data';
import * as Equal from 'effect/Equal';
import * as Record from 'effect/Record';

export const purgeUndefinedKeys = <A extends Record<string, any>>(obj: A): A =>
  Record.filter(obj, (v) => v !== undefined) as A;

export const unsafeDeepHash = <A>(data: A): A => {
  if (!data || typeof data !== 'object') {
    return data;
  }
  if (Equal.isEqual(data)) {
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

export const parseHex = (hex: number | string) => {
  if (typeof hex !== 'string') {
    return hex;
  }
  if (hex.startsWith('#')) {
    return parseInt(hex.substring(1), 16);
  }
  return parseInt(hex);
};
