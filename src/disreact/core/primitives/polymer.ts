import * as proto from '#disreact/core/behaviors/proto.ts';
import type * as Document from '#disreact/core/Document.ts';
import type * as Node from '#disreact/core/Node.ts';
import type * as Polymer from '#disreact/core/Polymer.ts';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';
import type * as Monomer from '#disreact/core/Monomer.ts';

const Prototype = proto.type<Polymer.Polymer>({
  rc: 0,
  pc: 0,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id  : 'Polymer',
      pc   : this.pc,
      rc   : this.rc,
      stack: this.stack,
    };
  },
});

export const empty = (node: Node.Func, document: Document.Document): Polymer.Polymer =>
  proto.init(Prototype, {
    document: document,
    node    : node,
    stack   : [],
    queue   : [],
  });

export const push = (self: Polymer.Polymer, monomer: Monomer.Monomer) => {
  self.stack.push(monomer);
  self.pc++;
  return self;
};

export const pull = (self: Polymer.Polymer): Monomer.Monomer | undefined => {
  return self.stack.at(self.pc);
};
