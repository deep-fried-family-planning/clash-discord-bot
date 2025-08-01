import type * as Marker from '#disreact/core/Marker.ts';
import type * as Traversable from '#disreact/core/Traversable.ts';
import * as Element from '#disreact/engine/internal/Element.ts';
import * as Entrypoint from '#disreact/engine/runtime/Entrypoint.ts';
import * as Hydrant from '#disreact/engine/internal/Hydrant.ts';
import type * as Jsx from '#disreact/engine/internal/Jsx.tsx';
import {declareProto, fromProto} from '#disreact/util/proto.ts';
import * as Deferred from 'effect/Deferred';
import * as Effect from 'effect/Effect';
import {dual, pipe} from 'effect/Function';
import {globalValue} from 'effect/GlobalValue';
import * as Inspectable from 'effect/Inspectable';
import * as Mailbox from 'effect/Mailbox';
import * as Pipeable from 'effect/Pipeable';
import * as SubscriptionRef from 'effect/SubscriptionRef';

export interface Envelope<A = any> extends Inspectable.Inspectable,
  Pipeable.Pipeable,
  Traversable.Ancestor<Envelope<A>>
{
  src   : string;
  data  : A | null;
  flags : Set<Element.Element>;
  input : Hydrant.Hydrant;
  target: Hydrant.Hydrant | null;
  root  : Element.Element;

  progress   : Mailbox.Mailbox<Marker.Marker<Element.PhaseData, Hydrant.Snapshot>>;
  current    : SubscriptionRef.SubscriptionRef<Marker.Stage<Hydrant.Snapshot> | null>;
  initialized: Deferred.Deferred<Hydrant.Snapshot>;
  hydrated   : Deferred.Deferred<Hydrant.Snapshot>;
  dispatched : Deferred.Deferred<Hydrant.Snapshot>;
  completed  : Deferred.Deferred<Hydrant.Snapshot | null>;
  final      : Deferred.Deferred<Hydrant.Snapshot | null>;
}

const EnvelopePrototype = declareProto<Envelope>({
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id : 'Envelope',
      root: this.root,
      data: this.data,
    };
  },
  progress   : undefined as any,
  current    : undefined as any,
  initialized: undefined as any,
  hydrated   : undefined as any,
  dispatched : undefined as any,
  completed  : undefined as any,
  final      : undefined as any,
  flags      : undefined as any,
  src        : '',
  data       : null,
  input      : undefined as any,
  root       : undefined as any,
  target     : null,
  parent     : undefined,
});

const effects = pipe(
  Effect.all({
    progress   : Mailbox.make<Marker.Marker<Element.PhaseData, Hydrant.Snapshot>>(),
    current    : SubscriptionRef.make<Marker.Stage<Hydrant.Snapshot> | null>(null),
    initialized: Deferred.make<Hydrant.Snapshot>(),
    hydrated   : Deferred.make<Hydrant.Snapshot>(),
    dispatched : Deferred.make<Hydrant.Snapshot>(),
    completed  : Deferred.make<Hydrant.Snapshot | null>(),
    final      : Deferred.make<Hydrant.Snapshot | null>(),
  }),
  Effect.map((all) => {
    const self = fromProto(EnvelopePrototype);
    self.progress = all.progress;
    self.current = all.current;
    self.initialized = all.initialized;
    self.hydrated = all.hydrated;
    self.dispatched = all.dispatched;
    self.completed = all.completed;
    self.flags = new Set();
    return self;
  }),
);

export const make = dual<
  (data?: any) => (hydrant: Hydrant.Hydrant) => Effect.Effect<Envelope>,
  (hydrant: Hydrant.Hydrant, data?: any) => Effect.Effect<Envelope>
>(2, (hydrant, data) =>
  Effect.map(effects, (self) => {
    self.src = hydrant.src;
    self.data = data;
    self.input = hydrant;
    self.target = hydrant;
    self.root = Element.makeRoot(hydrant.entry, self);
    return self as Envelope;
  }),
);

export const fork = (self: Envelope) =>
  Effect.map(effects, (forked) => {
    forked.progress = self.progress;
    forked.current = self.current;
    forked.final = self.final;
    forked.src = self.target!.src;
    forked.data = self.data;
    forked.input = self.target!;
    forked.target = self.target!;
    forked.root = Element.makeRoot(self.target!.entry, forked);
    return forked;
  });

export const dispose = (self: Envelope) =>
  pipe(
    Effect.void,
    Effect.map(() => {
      (self.flags as any) = undefined;
      (self.root as any) = undefined;
      (self.data as any) = undefined;
      return self;
    }),
  );

export const fail = dual<
  (self: Envelope) => (error: any) => Effect.Effect<void>,
  (error: any, self: Envelope) => Effect.Effect<void>
>(2, (error, self) =>
  Effect.all(
    [
      self.progress.fail(error as never),
      Deferred.fail(self.initialized, error as never),
      Deferred.fail(self.hydrated, error as never),
      Deferred.fail(self.dispatched, error as never),
      Deferred.fail(self.completed, error as never),
      Deferred.fail(self.final, error as never),
    ],
    {
      discard: true,
    },
  ),
);

const events = globalValue(Symbol.for('disreact/events'), () => new WeakMap<any, Envelope>());

const EventPrototype = declareProto<Jsx.Event>({
  id    : '',
  type  : '',
  target: undefined as any,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id   : 'Event',
      id    : this.id,
      type  : this.type,
      target: this.target,
    };
  },
  close() {
    const self = events.get(this);

    if (!self) {
      throw new Error('Invalid event handle');
    }
    self.target = null;
    events.delete(this);
  },
  open(type: any, props: any) {
    const self = events.get(this);

    if (!self) {
      throw new Error('Invalid event handle');
    }
    if (props?.children || type.props?.children) {
      throw new Error('Invalid props.children');
    }
    if (!Entrypoint.isRegistered(type)) {
      throw new Error('Unregistered source');
    }
    self.target = Hydrant.unsafeFromRegistry(type, props);
    events.delete(this);
  },
});

export const bindEvent = dual<
  (input: Hydrant.Event) => (self: Envelope) => Jsx.Event,
  (self: Envelope, input: Hydrant.Event) => Jsx.Event
>(2, (self, input) => {
  const event = fromProto(EventPrototype);
  event.id = input.id;
  event.type = input.type;
  event.target = input.target;
  events.set(event, self);
  return event;
});
