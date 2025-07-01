import type {Mono} from '#disreact/core/behaviors/exp/polymerold.ts';
import type * as Hydrant from '#disreact/core/Hydrant.ts';
import type * as Monomer from '#disreact/core/Monomer.ts';
import type * as Node from '#disreact/core/Node.ts';
import * as internal from '#disreact/core/internal/document.ts';
import * as E from 'effect/Effect';
import type * as Inspectable from 'effect/Inspectable';
import * as Mailbox from 'effect/Mailbox';
import type * as Pipeable from 'effect/Pipeable';
import type * as Deferred from 'effect/Deferred';
import type * as Polymer from '#disreact/core/Polymer.ts';
import type * as Fn from '#disreact/core/Fn.ts';



export interface Input<A = any> {
  endpoint   : string;
  body       : Node.Node;
  interaction: A;
  event?     : Fn.EventInput;
  trie       : Record<string, Monomer.Encoded[]>;
}

export interface Simulation<A = any> extends Input<A>, Pipeable.Pipeable, Inspectable.Inspectable {
  flags    : Set<Node.Func>;
  outstream: Mailbox.Mailbox<any>;
}

export const make = (input: Input): E.Effect<Simulation> =>
  E.map(Mailbox.make(), (outstream) => {
    const self = internal.make(input);
    self.outstream = outstream;
    return self;
  });

export const fork = (self: Simulation) => {

};

export const getFlags = (self: Simulation) => internal.getFlags(self);

export const hasEncodings = (self: Simulation) => internal.hasEncodings(self);

export const addEncoding = (self: Simulation, id: string, encoded: Monomer.Encoded) => internal.addEncoding(self, id, encoded);

export const getEncoding = (self: Simulation, id: string) => internal.getEncoding(self, id);
