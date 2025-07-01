import * as proto from '#disreact/core/behaviors/proto.ts';
import type * as Monomer from '#disreact/core/Monomer.ts';
import type * as Node from '#disreact/core/Node.ts';
import type * as Polymer from '#disreact/core/Polymer.ts';
import type * as Document from '#disreact/core/Simulation.ts';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';

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

export const empty = (node: Node.Func, document: Document.Simulation): Polymer.Polymer =>
  proto.init(Prototype, {
    document: document,
    node    : node,
    stack   : [],
    queue   : [],
  });

export const isStateless = (self: Polymer.Polymer) => self.stack.length === 0;

export const push = (self: Polymer.Polymer, monomer: Monomer.Monomer) => {
  self.stack.push(monomer);
  self.pc++;
};

export const pull = (self: Polymer.Polymer): Monomer.Monomer | undefined => {
  const monomer = self.stack.at(self.pc);
  if (!monomer) {
    return undefined;
  }
  self.pc++;
  return monomer;
};

export const hasEffects = (self: Polymer.Polymer) => self.queue.length > 0;

export const enqueue = (self: Polymer.Polymer, monomer: Monomer.Effectful) => {
  self.queue.push(monomer);
};

export const dequeue = (self: Polymer.Polymer): Monomer.Effectful => {
  return self.queue.shift()!;
};
