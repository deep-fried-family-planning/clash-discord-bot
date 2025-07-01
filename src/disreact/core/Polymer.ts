import * as proto from '#disreact/core/behaviors/proto.ts';
import type * as Document from '#disreact/core/Document.ts';
import {dehydrateMonomer} from '#disreact/core/Monomer.ts';
import * as Monomer from '#disreact/core/Monomer.ts';
import type * as Node from '#disreact/core/Node.ts';
import * as polymer from '#disreact/core/primitives/polymer.ts';
import type * as Lateral from '#src/disreact/core/behaviors/lateral.ts';
import type * as Lineage from '#src/disreact/core/behaviors/lineage.ts';
import {MONOMER_CONTEXTUAL, MONOMER_EFFECT, MONOMER_MEMO, MONOMER_NONE, MONOMER_REDUCER, MONOMER_REF, MONOMER_STATE} from '#src/disreact/core/primitives/constants.ts';
import * as E from 'effect/Effect';
import type * as Inspectable from 'effect/Inspectable';
import type * as Pipeable from 'effect/Pipeable';
import * as P from 'effect/Predicate';

export type EffectOutput = | void
                           | Promise<void>
                           | E.Effect<void>;

export type Effectful = E.Effect<void>;

export interface EffectFn {
  (): EffectOutput;
}

export type Effect = | EffectFn
                     | E.Effect<void>;

export interface Polymer extends Pipeable.Pipeable, Inspectable.Inspectable, Lineage.Lineage, Lateral.Lateral {
  document: Document.Document;
  node    : Node.Func;
  pc      : number;
  rc      : number;
  stack   : Monomer.Monomer[];
  queue   : Monomer.Effect[];
}

export const mount = (node: Node.Func, document: Document.Document): Polymer => {
  const self = polymer.empty();
  self.node = node;
  self.document = document;
  return self;
};

export const hydrate = (node: Node.Node, stack: Monomer.Encoded[]): Polymer => {
  const monomers = [] as Monomer.Monomer[];
  for (let i = 0; i < stack.length; i++) {
    const monomer = Monomer.hydrateMonomer(stack[i]);
    monomers.push(monomer);
  }
  return polymer.empty();
};

export const dehydrate = (self: Polymer): Monomer.Encoded[] => {
  const encoded = [] as Monomer.Encoded[];
  for (let i = 0; i < self.stack.length; i++) {
    const monomer = self.stack[i];
    encoded.push(dehydrateMonomer(monomer));
  }
  return encoded;
};

export const dispose = (self: Polymer) => {
  if (self.queue.length) {
    throw new Error();
  }
  (self as any).document = undefined;
  (self as any).node = undefined;
};

export const commit = (self: Polymer): Polymer => {
  for (let i = 0; i < self.stack.length; i++) {
    if (self.stack[i]._tag === MONOMER_STATE) {
      self.stack[i].changed = false;
    }
  }
  return self;
};

export const isChanged = (self: Polymer): boolean => {
  for (let i = 0; i < self.stack.length; i++) {
    if (Monomer.isChanged(self.stack[i])) {
      return true;
    }
  }
  return false; // todo
};

export const render = (self: Polymer): Polymer => {
  return self;
};

export const invoke = (self: Polymer): E.Effect<Polymer> => {
  if (!self.queue.length) {
    return E.succeed(self);
  }
  return E.iterate(self, {
    while: (p) => p.queue.length > 0,
    body : (p) => {
      const monomer = p.queue.shift()!;
      const effect = monomer.fn!;

      if (proto.isAsync(effect)) {
        return E.promise(() => effect()).pipe(E.as(p));
      }
      const out = effect();

      if (P.isPromise(out)) {
        return E.promise(() => out as Promise<void>).pipe(E.as(p));
      }
      if (proto.isEffect(out)) {
        return out.pipe(E.as(p));
      }
      return E.succeed(p);
    },
  });
};
