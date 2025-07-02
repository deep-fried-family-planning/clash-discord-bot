import type * as Fn from '#disreact/core/Fn.ts';
import type {FC} from '#disreact/core/Fn.ts';
import type * as Output from '#disreact/core/immutable/output.ts';
import * as internal from '#disreact/core/internal/document.ts';
import type * as Polymer from '#disreact/core/Polymer.ts';
import type * as Node from '#disreact/core/Node.ts';
import * as Deferred from 'effect/Deferred';
import * as E from 'effect/Effect';
import {dual} from 'effect/Function';
import type * as Inspectable from 'effect/Inspectable';
import * as Mailbox from 'effect/Mailbox';
import type * as Pipeable from 'effect/Pipeable';

export interface AdaptorEvent<D = any> {
  endpoint: string;
  id      : string;
  lookup  : string;
  handler : string;
  data    : D;
}

export interface Event<D = any, T = any> {
  target: T;
  data  : D;
  close(): void;
  open(node: Node.Node): void;
  openFC<P>(component: FC<P>, props: P): void;
}

export interface InternalEvent<D = any, T = any> extends AdaptorEvent<D>, Event<D, T>, Inspectable.Inspectable {
  compare: {
    endpoint: string | null;
    props   : any;
  };
}

export interface AdaptorDocument<A = any> {
  endpoint   : string;
  body       : Node.Node;
  interaction: A;
  event?     : Fn.EventInput;
  trie       : Record<string, Polymer.Encoded[]>;
}

export interface Document<A = any> extends AdaptorDocument<A>, Pipeable.Pipeable, Inspectable.Inspectable {
  flags    : Set<Node.Func>;
  outstream: Mailbox.Mailbox<Output.Output>;
  final    : Deferred.Deferred<Output.Checkpoint>;
  done     : Deferred.Deferred<Output.Checkpoint>;
  prev?    : Document<A> | undefined;
  next?    : Document<A> | undefined;
}

const effects = E.all([
  Mailbox.make<Output.Output>(),
  Deferred.make<Output.Checkpoint>(),
]);

export const make = (input: AdaptorDocument): E.Effect<Document> =>
  effects.pipe(
    E.map(([outstream, finalized]) => {
      const self = internal.make(input);
      self.outstream = outstream;
      self.final = finalized;
      return self;
    }),
  );

export const fork = (self: Document) => {
  Deferred.await;
};

export const getFlags = (self: Document) => internal.getFlags(self);

export const hasEncodings = (self: Document) => internal.hasEncodings(self);

export const addEncodingDF = (self: Document, id: string, encoded: Polymer.Encoded[]) => {
  internal.addEncoding(self, id, encoded);
  return self;
};

export const addEncoding = dual<
  <A>(id: string, encoded: Polymer.Encoded[]) => (self: Document<A>) => Document<A>,
  <A>(self: Document<A>, id: string, encoded: Polymer.Encoded[]) => Document<A>
>(3, addEncodingDF);

const getEncodingF = (self: Document, id: string) => internal.getEncoding(self, id);

export const getEncoding = dual<
  <A>(id: string) => (self: Document<A>) => Polymer.Encoded[] | undefined,
  <A>(self: Document<A>, id: string) => Polymer.Encoded[] | undefined
>(2, getEncodingF);

const offerAllDF = (self: Document, output: Output.Output[]) =>
  self.outstream.offerAll(output).pipe(E.asVoid);

export const offerAll = dual<
  <A>(output: Output.Output[]) => (self: Document<A>) => E.Effect<void>,
  <A>(self: Document<A>, output: Output.Output[]) => E.Effect<void>
>(2, offerAllDF);

export const takeAll = (self: Document) =>
  self.outstream.takeAll;

const failDF = (self: Document, error: any) =>
  self.final.pipe(
    Deferred.fail(error as never),
    E.andThen(self.outstream.fail(error as never)),
  );

export const fail = dual<
  <A>(error: any) => (self: Document<A>) => E.Effect<void>,
  <A>(self: Document<A>, error: any) => E.Effect<void>
>(2, failDF);

export const streamEnd = (self: Document) =>
  self.outstream.end;

export const join = (self: Document) =>
  self.final.pipe(
    Deferred.await,
    E.andThen(self.outstream.end),
  );

const finalDF = (self: Document, final: Output.Checkpoint) =>
  self.final.pipe(
    Deferred.succeed(final),
    E.andThen(self.outstream.offer(final)),
    E.andThen(self.outstream.end),
  );

export const final = dual<
  <A>(final: Output.Checkpoint) => (self: Document<A>) => E.Effect<void>,
  <A>(self: Document<A>, final: Output.Checkpoint) => E.Effect<void>
>(2, finalDF);

export const dispose = (self: Document) => {

};
