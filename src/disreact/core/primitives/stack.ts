import type * as Stack from '#disreact/core/Stack.ts';
import * as proto from '#disreact/core/behaviors/proto.ts';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';

const Prototype = proto.type<Stack.Stack<any>>({
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id   : 'Stack',
      values: this.values,
    });
  },
});

export const make = (root: any): Stack.Stack<any> =>
  proto.init(Prototype, {
    values: [root],
  });

export const push = (self: Stack.Stack<any>, value: any) => {
  self.values.push(value);
  return self;
};

export const pop = <A>(self: Stack.Stack<any>): A | undefined => {
  return self.values.pop();
};

export const peek = <A>(self: Stack.Stack<any>): A | undefined => self.values.at(-1);

export const len = <A>(self: Stack.Stack<any>): number => self.values.length;
