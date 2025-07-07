import * as proto from '#disreact/core/behaviors/proto.ts';
import type * as Document from '#disreact/core/Document.ts';
import type * as Stack from '#disreact/core/Stack.ts';
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

export const make = (document: Document.Document, root = document.body): Stack.Stack<any> =>
  proto.init(Prototype, {
    origin   : document,
    root     : root,
    values   : [root],
    pop      : [],
    push     : [root],
    traversed: [],
  });

export const len = <A>(self: Stack.Stack<any>): number => self.values.length;

export const push = (self: Stack.Stack<any>, value: any) => {
  self.pop = [];
  self.push.push(value);
  self.values.push(value);
  return self;
};

export const pushed = (self: Stack.Stack<any>) => {
  const values = self.push;
  self.push = [];
  return values;
};

export const peek = <A>(self: Stack.Stack<any>) => self.values.at(-1);

export const pop = <A>(self: Stack.Stack<any>) => {
  self.push = [];
  const value = self.values.pop();
  self.pop.push(value);
  self.traversed.push(value);
  return value;
};

export const popped = (self: Stack.Stack<any>) => {
  const values = self.pop;
  self.pop = [];
  return values;
};

export const dispose = (self: Stack.Stack<any>) => {
  (self.document as any) = undefined;
  (self.values as any) = undefined;
  (self.pop as any) = undefined;
  (self.push as any) = undefined;
  (self.traversed as any) = undefined;
  return self;
};
