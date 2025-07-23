import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Pipeable from 'effect/Pipeable';
import * as Inspectable from 'effect/Inspectable';

export const ASYNC_CONSTRUCTOR = (async () => {}).constructor;

export const StructProto = {
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  [Hash.symbol]() {
    return Hash.structure(this); // todo
  },
  [Equal.symbol](this: any, that: any) {
    const selfKeys = Object.keys(this);
    const thatKeys = Object.keys(that);
    if (selfKeys.length !== thatKeys.length) {
      return false;
    }
    for (const key of selfKeys) {
      if (!(key in that)) {
        return false;
      }
      if (Equal.equals(this[key], that[key])) {
        return false;
      }
    }
    return true;
  },
};

export const ArrayProto: Equal.Equal = {
  [Hash.symbol]() {
    return Hash.structure(this); // todo
  },
  [Equal.symbol](this: any, that: any) {
    if (!Array.isArray(that) || this.length !== that.length) {
      return false;
    }
    for (let i = 0; i < this.length; i++) {
      if (!Equal.equals(this[i], that[i])) {
        return false;
      }
    }
    return true;
  },
};
