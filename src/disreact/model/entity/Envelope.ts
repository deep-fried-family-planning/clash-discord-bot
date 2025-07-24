import type * as Progress from '#disreact/model/core/Progress.ts';
import * as Element from '#disreact/model/entity/Element.ts';
import type * as Hydrant from '#disreact/model/entity/Hydrant.ts';
import * as Deferred from 'effect/Deferred';
import * as Effect from 'effect/Effect';
import {dual, pipe} from 'effect/Function';
import * as Inspectable from 'effect/Inspectable';
import * as Mailbox from 'effect/Mailbox';

export interface Envelope<A = any> extends Inspectable.Inspectable
{
  data    : A;
  hydrant : Hydrant.Hydrant;
  root    : Element.Element;
  flags   : Set<Element.Component>;
  deferred: Deferred.Deferred<Progress.Checkpoint>;
  final   : Deferred.Deferred<Progress.Checkpoint>;
  stream  : Mailbox.Mailbox<Progress.Progress>;
}

const EnvelopePrototype: Envelope = {
  data    : undefined as any,
  hydrant : undefined as any,
  root    : undefined as any,
  flags   : undefined as any,
  stream  : undefined as any,
  deferred: undefined as any,
  final   : undefined as any,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id : 'Envelope',
      root: this.root,
      data: this.data,
    };
  },
};

const makeDeferred = Deferred.make<Progress.Checkpoint>();

const makeEffect = pipe(
  Effect.all([
    makeDeferred,
    Deferred.make<Progress.Checkpoint>(),
    Mailbox.make<Progress.Progress>(),
  ]),
  Effect.map(([deferred, final, stream]) => {
    const self = Object.create(EnvelopePrototype) as Envelope;
    self.deferred = deferred;
    self.final = final;
    self.stream = stream;
    self.flags = new Set();
    return self;
  }),
);

export const make = <A>(data: A, hydrant: Hydrant.Hydrant) =>
  makeEffect.pipe(
    Effect.map((self) => {
      self.data = data;
      self.hydrant = hydrant;
      self.root = Element.makeRoot(hydrant.source, self);
      return self as Envelope<A>;
    }),
  );

export const fork = <A>(self: Envelope<A>) =>
  makeDeferred.pipe(
    Effect.map((deferred) => {
      const fork = Object.create(EnvelopePrototype) as Envelope;
      fork.deferred = deferred;
      fork.final = self.final;
      fork.stream = self.stream;
      fork.flags = self.flags;
      fork.data = self.data;
      fork.hydrant = self.hydrant;
      return fork;
    }),
  );

export const dispose = (self: Envelope) =>
  pipe(
    Deferred.await(self.deferred),
    Effect.map(() => {
      (self.flags as any) = undefined;
      (self.root as any) = undefined;
      (self.data as any) = undefined;
      (self.hydrant as any) = undefined;
      return self;
    }),
  );
