import type * as Element from '#disreact/core/Element.ts';
import type * as FC from '#disreact/core/FC.ts';
import type * as Output from '#disreact/core/immutable/output.ts';
import * as document from '#disreact/core/internal/document.ts';
import type * as Polymer from '#disreact/core/Polymer.ts';
import * as Traversal from '#disreact/core/Traversal.ts';
import * as Deferred from 'effect/Deferred';
import * as E from 'effect/Effect';
import {dual} from 'effect/Function';
import type * as Inspectable from 'effect/Inspectable';
import * as Mailbox from 'effect/Mailbox';
import type * as Pipeable from 'effect/Pipeable';

export interface Hydrant {
  version?: string;
  key?    : string;
  hash?   : string;
  endpoint: string;
  props   : Record<string, any>;
  state   : Record<string, Polymer.Encoded[]>;
}

export const hydrant = (
  endpoint: string,
  props: Record<string, any>,
  state: Record<string, Polymer.Encoded[]>,
) => ({
  endpoint,
  props,
  state,
});

export interface Endpoint extends Inspectable.Inspectable {
  id       : string;
  component: FC.FC;
}

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
  open(node: Element.Element): void;
  openFC<P>(component: FC.FC<P>, props: P): void;
}

export interface AdaptorDocument<A = any> {
  endpoint   : string;
  body       : Element.Element;
  interaction: A;
  event?     : AdaptorEvent;
  trie       : Record<string, Polymer.Encoded[]>;
}

export interface Document<A = any> extends Pipeable.Pipeable,
  Inspectable.Inspectable,
  Traversal.Sibling<Document<A>>,
  AdaptorDocument<A>
{
  body       : Element.Element;
  interaction: A;
  event?     : AdaptorEvent;
  trie       : Record<string, Polymer.Encoded[]>;
  endpoint   : string;
  stage      : string;
  flags      : Set<Element.Element>;
  outstream  : Mailbox.Mailbox<Output.Output>;
  final      : Deferred.Deferred<Output.Checkpoint>;
  done       : Deferred.Deferred<Output.Checkpoint>;
}

const effects = E.all([
  Mailbox.make<Output.Output>(),
  Deferred.make<Output.Checkpoint>(),
]);

export const make = (input: AdaptorDocument): E.Effect<Document> => {
  return effects.pipe(
    E.map(([outstream, final]) => {
      const self = document.make(input);
      self.outstream = outstream;
      self.final = final;
      return self;
    }),
  );
};

export const fork = (self: Document, endpoint: string, body: Element.Element) => {
  const forked = document.make({
    endpoint   : endpoint,
    body       : body,
    interaction: self.interaction,
    trie       : {},
  });
  self.tail = forked;
  forked.head = self;
  forked.outstream = self.outstream;
  forked.final = self.final;
  return forked;
};

export const reset = (self: Document): E.Effect<Document> =>
  effects.pipe(
    E.map(([outstream, final]) => {
      const as = Traversal.adjacencyList(self);
      if (as.length === 1) {
        self.outstream = outstream;
        self.final = final;
        return self;
      }
      const [last, ...rest] = as.reverse();
      last.outstream = outstream;
      last.final = final;
      rest.forEach(document.dispose);
      return last;
    }),
  );

export const getFlags = (self: Document) => document.getFlags(self);

export const hasEncodings = (self: Document) => document.hasEncodings(self);

export const addEncodingDF = (self: Document, id: string, encoded: Polymer.Encoded[]) => {
  document.addEncoding(self, id, encoded);
  return self;
};

export const addEncoding = dual<
  <A>(id: string, encoded: Polymer.Encoded[]) => (self: Document<A>) => Document<A>,
  <A>(self: Document<A>, id: string, encoded: Polymer.Encoded[]) => Document<A>
>(3, addEncodingDF);

const getEncodingF = (self: Document, id: string) => document.getEncoding(self, id);

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
