import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Inspectable from 'effect/Inspectable';

export type Internal = never;

const PropsPrototype: Record<string, any> = {
  [Hash.symbol]() {
    return Hash.structure(this);
  },
  [Equal.symbol]() {
    throw new Error();
  },
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id  : 'Props',
      value: this,
    });
  },
};

export const makeProps = (props: any): Record<string, any> => {
  return props;
};

export const makeRestProps = (props: any): Record<string, any> => {
  return props;
};
