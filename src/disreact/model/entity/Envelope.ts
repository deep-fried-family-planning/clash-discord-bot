import type * as Progress from '#disreact/core/Progress.ts';
import * as Element from '#disreact/model/entity/Element.ts';
import type * as Event from '#disreact/model/entity/Event.ts';
import * as Hydrant from '#disreact/runtime/Hydrant.ts';
import type * as Polymer from '#disreact/model/entity/Polymer.ts';
import * as Deferred from 'effect/Deferred';
import * as Effect from 'effect/Effect';
import {dual, pipe} from 'effect/Function';
import * as Inspectable from 'effect/Inspectable';
import * as Mailbox from 'effect/Mailbox';
import type * as Option from 'effect/Option';
import type * as Record from 'effect/Record';

export interface Simulant<A = any> {
  data      : A;
  entrypoint: string;
  props     : Record<string, any>;
  state     : Record<string, any>;
  hydrant?  : Hydrant.Encoded;
  event?    : Event.EventInput;
}

export interface Simulated<T extends string, P = any> {
  type      : T;
  encoded   : P;
  entrypoint: Option.Option<string>;
  props     : Record<string, any>;
  state     : Record<string, any>;
}

export interface Envelope<A = any> extends Inspectable.Inspectable {
  data    : A;
  hydrant : Hydrant.Hydrant;
  root    : Element.Element;
  polymers: Record<string, Polymer.Polymer>;
  flags   : Set<Element.Element>;
  final   : Deferred.Deferred<Progress.Checkpoint>;
  stream  : Mailbox.Mailbox<Progress.Progress>;
}

const Proto: Envelope = {
  data    : undefined as any,
  hydrant : undefined as any,
  root    : undefined as any,
  stream  : undefined as any,
  final   : undefined as any,
  flags   : undefined as any,
  polymers: undefined as any,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id : 'Envelope',
      root: this.root,
      data: this.data,
    };
  },
};

const make = pipe(
  Effect.all([
    Deferred.make<Progress.Checkpoint>(),
    Mailbox.make<Progress.Progress>(),
  ]),
  Effect.map(([final, stream]) => {
    const self = Object.create(Proto) as Envelope;
    self.stream = stream;
    self.final = final;
    self.flags = new Set();
    return self;
  }),
);

export const fromHydrant = dual<
  (data: any) => (hydrant: Hydrant.Hydrant) => Effect.Effect<Envelope>,
  (hydrant: Hydrant.Hydrant, data: any) => Effect.Effect<Envelope>
>(2, (hydrant: Hydrant.Hydrant, data: any) =>
  make.pipe(
    Effect.map((self) => {
      self.data = data;
      self.hydrant = hydrant;
      self.root = Element.makeRoot(Hydrant.toJsx(hydrant), self);
      return self;
    }),
  ),
);

export const dispose = (self: Envelope) =>
  Effect.asVoid(
    Effect.die('Not Implemented'),
  );
