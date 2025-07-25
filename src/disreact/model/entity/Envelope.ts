import * as Progress from '#disreact/model/core/Progress.ts';
import * as Element from '#disreact/model/entity/Element.ts';
import * as Hydrant from '#disreact/model/entity/Hydrant.ts';
import type * as Jsx from '#disreact/model/entity/Jsx.tsx';
import * as Entrypoint from '#disreact/runtime/Entrypoint.ts';
import {declareProto, fromProto} from '#disreact/util/proto.ts';
import * as Deferred from 'effect/Deferred';
import * as Effect from 'effect/Effect';
import {dual, pipe} from 'effect/Function';
import {globalValue} from 'effect/GlobalValue';
import * as Inspectable from 'effect/Inspectable';
import * as Mailbox from 'effect/Mailbox';
import * as Option from 'effect/Option';
import type * as Pipeable from 'effect/Pipeable';
import * as SubscriptionRef from 'effect/SubscriptionRef';

export interface Envelope<A = any> extends Inspectable.Inspectable,
  Pipeable.Pipeable
{
  data?: A;
  curr : Hydrant.Hydrant;
  next : Option.Option<Hydrant.Hydrant>;
  root : Element.Element;
  flags: Set<Element.Element>;

  snapshots: SubscriptionRef.SubscriptionRef<Hydrant.Snapshot>;
  complete : Deferred.Deferred<Hydrant.Snapshot>;
  _final   : Deferred.Deferred<Hydrant.Snapshot>;
  _stream  : Mailbox.Mailbox<Progress.Progress>;
}

const EnvelopePrototype = declareProto<Envelope>({
  data     : undefined as any,
  root     : undefined as any,
  curr     : undefined as any,
  next     : undefined as any,
  flags    : undefined as any,
  complete : undefined as any,
  snapshots: undefined as any,
  _final   : undefined as any,
  _stream  : undefined as any,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id : 'Envelope',
      root: this.root,
      data: this.data,
    };
  },
});

const effects = pipe(
  Effect.all([
    Deferred.make<Hydrant.Snapshot>(),
    Deferred.make<Hydrant.Snapshot>(),
    Mailbox.make<Progress.Progress>(),
    SubscriptionRef.make<Hydrant.Snapshot>({} as any),
  ]),
  Effect.map(([complete, final, stream, snapshots]) => {
    const self = Object.create(EnvelopePrototype) as Envelope;
    self.complete = complete;
    self.snapshots = snapshots;
    self._final = final;
    self._stream = stream;
    self.flags = new Set();
    return self;
  }),
);

export const make = dual<
  (data?: any) => (hydrant: Hydrant.Hydrant) => Effect.Effect<Envelope>,
  (hydrant: Hydrant.Hydrant, data?: any) => Effect.Effect<Envelope>
>(2, (hydrant, data) =>
  effects.pipe(
    Effect.map((self) => {
      self.data = data;
      self.curr = hydrant;
      self.next = Option.some(hydrant);
      self.root = Element.makeRoot(hydrant.entry, self);
      return self as Envelope;
    }),
  ),
);

export const dispose = (self: Envelope) =>
  pipe(
    Deferred.await(self.complete),
    Effect.map(() => {
      (self.flags as any) = undefined;
      (self.root as any) = undefined;
      (self.data as any) = undefined;
      return self;
    }),
  );

export const addSnapshot = dual<
  (self: Envelope) => (snapshot: Hydrant.Snapshot) => Effect.Effect<Envelope>,
  (snapshot: Hydrant.Snapshot, self: Envelope) => Effect.Effect<Envelope>
>(2, (snapshot, self) =>
  pipe(
    self._stream.offer(
      Progress.checkpoint(self.curr.src, snapshot),
    ),
    Effect.andThen(SubscriptionRef.set(self.snapshots, snapshot)),
    Effect.as(self),
  ),
);

export const completeSnapshot = dual<
  (self: Envelope) => (snapshot: Hydrant.Snapshot) => Effect.Effect<Envelope>,
  (snapshot: Hydrant.Snapshot, self: Envelope) => Effect.Effect<Envelope>
>(2, (snapshot, self) =>
  pipe(
    Deferred.succeed(
      self.complete,
      snapshot,
    ),
    Effect.andThen(
      self._stream.offer(
        Progress.checkpoint(self.curr.src, snapshot),
      ),
    ),
    Effect.andThen(SubscriptionRef.set(self.snapshots, snapshot)),
    Effect.as(self),
  ),
);

export const finalizeSnapshot = dual<
  (self: Envelope) => (snapshot: Hydrant.Snapshot) => Effect.Effect<Envelope>,
  (snapshot: Hydrant.Snapshot, self: Envelope) => Effect.Effect<Envelope>
>(2, (snapshot, self) =>
  pipe(
    Deferred.succeed(
      self._final,
      snapshot,
    ),
    Effect.andThen(
      self._stream.offerAll([
        Progress.checkpoint(self.curr.src, snapshot),
        Progress.done(),
      ]),
    ),
    Effect.andThen(self._stream.end),
    Effect.andThen(SubscriptionRef.set(self.snapshots, snapshot)),
    Effect.as(self),
  ),
);

export const awaitFinal = (self: Envelope) => Deferred.await(self._final);

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
    self.next = Option.none();
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
    self.next = Option.some(Hydrant.unsafeFromRegistry(type, props));
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

export const patch = dual<
  (self: Envelope) => (patches: [Hydrant.HydrantPatch, Progress.Change]) => Effect.Effect<Envelope>,
  (patches: [Hydrant.HydrantPatch, Progress.Change], self: Envelope) => Effect.Effect<Envelope>
>(2, ([patch, progress], self) =>
  pipe(
    progress,
    self._stream.offer,
    Effect.flatMap(() => {
      switch (patch._tag) {
        case 'Skip': {
          return Effect.succeed(self);
        }
        case 'Remove': {
          return Effect.succeed(self);
        }
        case 'Replace': {
          return Effect.succeed(self);
        }
        case 'Update': {
          return Effect.succeed(self);
        }
      }
    }),
  ),
);
