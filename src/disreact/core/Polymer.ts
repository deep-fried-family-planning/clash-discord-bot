import type * as Lateral from '#disreact/core/behaviors/lateral.ts';
import type * as Lineage from '#disreact/core/behaviors/lineage.ts';
import * as proto from '#disreact/core/behaviors/proto.ts';
import type * as Document from '#disreact/core/Document.ts';
import * as Monomer from '#disreact/core/Monomer.ts';
import {dehydrateMonomer} from '#disreact/core/Monomer.ts';
import type * as Node from '#disreact/core/Node.ts';
import {MONOMER_STATE} from '#disreact/core/immutable/constants.ts';
import * as polymer from '#disreact/core/internal/polymer.ts';
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
  queue   : Monomer.Effectful[];
}

export const empty = (node: Node.Func, document: Document.Document): Polymer => polymer.empty(node, document);

export const hydrate = (node: Node.Func, document: Document.Document, stack?: Monomer.Encoded[]): Polymer => {
  const self = empty(node, document);
  if (!stack) {
    return self;
  }
  for (let i = 0; i < stack.length; i++) {
    self.stack.push(Monomer.hydrateMonomer(stack[i]));
  }
  return self;
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
  (self.document as any) = undefined;
  (self.node as any) = undefined;
  (self.stack as any) = undefined;
  (self.queue as any) = undefined;
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
