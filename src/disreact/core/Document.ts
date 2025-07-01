import type * as Fn from '#disreact/core/Fn.ts';
import type * as Hydrant from '#disreact/core/Hydrant.ts';
import type * as Output from '#disreact/core/immutable/output.ts';
import * as internal from '#disreact/core/internal/document.ts';
import type * as Monomer from '#disreact/core/Monomer.ts';
import type * as Node from '#disreact/core/Node.ts';
import * as Deferred from 'effect/Deferred';
import * as E from 'effect/Effect';
import type * as Inspectable from 'effect/Inspectable';
import * as Mailbox from 'effect/Mailbox';
import type * as Pipeable from 'effect/Pipeable';

export interface Input<A = any> {
  endpoint   : string;
  body       : Node.Node;
  interaction: A;
  hydrant    : Hydrant.Hydrant;
  event?     : Fn.EventInput;
  trie       : Record<string, Monomer.Encoded[]>;
}

export interface Document<A = any> extends Input<A>, Pipeable.Pipeable, Inspectable.Inspectable {
  flags    : Set<Node.Func>;
  outstream: Mailbox.Mailbox<Output.Output>;
  finalized: Deferred.Deferred<Output.Checkpoint>;
  prev?    : Document<A> | undefined;
  next?    : Document<A> | undefined;
}

const effects = E.all([
  Mailbox.make<Output.Output>(),
  Deferred.make<Output.Checkpoint>(),
]);

export const make = (input: Input): E.Effect<Document> =>
  effects.pipe(
    E.map(([outstream, finalized]) => {
      const self = internal.make(input);
      self.outstream = outstream;
      self.finalized = finalized;
      return self;
    }),
  );

export const fork = (self: Document) => {
  Deferred.await;
};

export const getFlags = (self: Document) => internal.getFlags(self);

export const hasEncodings = (self: Document) => internal.hasEncodings(self);

export const addEncoding = (self: Document, id: string, encoded: Monomer.Encoded[]) => internal.addEncoding(self, id, encoded);

export const getEncoding = (self: Document, id: string) => internal.getEncoding(self, id);

export const streamOfferAll = (self: Document, output: Output.Output[]) =>
  self.outstream.offerAll(output).pipe(E.asVoid);

export const streamTakeAll = (self: Document) =>
  self.outstream.takeAll;

export const streamFail = (self: Document, error: any) =>
  self.outstream.fail(error as never);

export const streamEnd = (self: Document) =>
  self.outstream.end;

export const streamAwait = (self: Document) =>
  self.outstream.await;

export const finalize = (self: Document, final: Output.Checkpoint) =>
  Deferred.succeed(self.finalized, final).pipe(
    E.andThen(self.outstream.offer(final)),
    E.andThen(self.outstream.end),
  );
