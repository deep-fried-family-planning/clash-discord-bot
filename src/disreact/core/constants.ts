import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';

export const ASYNC_CONSTRUCTOR = (async () => {}).constructor;

export const StructProto: Equal.Equal = {
  [Hash.symbol]() {
    return Hash.structure(this); // todo
  },
  [Equal.symbol](this: Equal.Equal, that: Equal.Equal) {
    const selfKeys = Object.keys(this);
    const thatKeys = Object.keys(that as object);
    if (selfKeys.length !== thatKeys.length) {
      return false;
    }
    for (const key of selfKeys) {
      if (!(key in (that as object))) {
        return false;
      }
      if (Equal.equals((this as any)[key], (that as any)[key])) {
        return false;
      }
    }
    return true;
  },
};
