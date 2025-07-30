import * as Progress from '#disreact/model/core/Progress.ts';
import * as Element from '#disreact/model/entity/Element.ts';
import * as Hydrant from '#disreact/model/entity/Hydrant.ts';
import type * as Jsx from '#disreact/model/entity/Jsx.tsx';
import * as Entrypoint from '#disreact/model/runtime/Entrypoint.ts';
import {declareProto, fromProto} from '#disreact/util/proto.ts';
import * as Deferred from 'effect/Deferred';
import * as Effect from 'effect/Effect';
import {dual, pipe} from 'effect/Function';
import {globalValue} from 'effect/GlobalValue';
import * as Inspectable from 'effect/Inspectable';
import * as Mailbox from 'effect/Mailbox';
import type * as Pipeable from 'effect/Pipeable';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import type * as Traversable from '#disreact/model/core/Traversable.ts';

export interface Event {

}

export interface Envelope<A = any> extends Inspectable.Inspectable,
  Pipeable.Pipeable,
  Traversable.Ancestor<Envelope<A>>
{
  data? : A;
  entry : Jsx.Jsx;
  flags : Set<Element.Element>;
  input : Hydrant.Hydrant;
  target: Hydrant.Hydrant | null;
  root  : Element.Element;

  snapshots: SubscriptionRef.SubscriptionRef<Hydrant.Snapshot>;
  complete : Deferred.Deferred<Hydrant.Snapshot>;
  _final   : Deferred.Deferred<Hydrant.Snapshot>;
  _stream  : Mailbox.Mailbox<Progress.Progress>;
}

const EnvelopePrototype = declareProto<Envelope>({
  data     : undefined as any,
  root     : undefined as any,
  input    : undefined as any,
  target   : null,
  flags    : undefined as any,
  parent   : undefined,
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
      self.input = hydrant;
      self.target = hydrant;
      self.root = Element.makeRoot(hydrant.entry, self);
      return self as Envelope;
    }),
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

export const diffSelf = (self: Envelope) => {

};

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

export const forkWith = dual<
  (hydrant: Hydrant.Hydrant) => (self: Envelope) => Effect.Effect<Envelope>,
  (self: Envelope, hydrant: Hydrant.Hydrant) => Effect.Effect<Envelope>
>(2, (self, hydrant) =>
  pipe(
    make(self.data)(hydrant),
    Effect.map((forked) => {
      forked._final = self._final;
      forked._stream = self._stream;
      forked.target = null;
      forked.parent = self;
      return forked;
    }),
  ),
);

export const fork = (self: Envelope) => Effect.suspend(() => {
  if (!self.target) {
    return Effect.as(
      self._stream.offer(Progress.change(self.input.src, 'Exit')),
      self,
    );
  }
  if (self.target.src === self.input.src) {
    return Effect.as(
      self._stream.offer(Progress.change(self.target.src, 'Next')),
      self,
    );
  }
  return self.target.pipe(
    make(self.data),
    Effect.map((forked) => {
      forked._final = self._final;
      forked._stream = self._stream;
      forked.target = null;
      forked.parent = self;
      return forked;
    }),
  );
});

export const fail = dual<
  (self: Envelope) => (error: any) => Effect.Effect<void>,
  (error: any, self: Envelope) => Effect.Effect<void>
>(2, (error, self) =>
  self._final.pipe(
    Deferred.fail(error as never),
    Effect.andThen(self._stream.fail(error as never)),
  ),
);

export const offerPartial = dual<
  (self: Envelope) => (p: Element.Element) => Effect.Effect<void>,
  (p: Element.Element, self: Envelope) => Effect.Effect<void>
>(2, (p, self) =>
  Effect.asVoid(
    self._stream.offer(
      Progress.partial(self.input.src, p),
    ),
  ),
);

export const offerAllPartial = dual<
  (self: Envelope) => (ps?: Element.Element[]) => Effect.Effect<void>,
  (ps: Element.Element[] | undefined, self: Envelope) => Effect.Effect<void>
>(2, (ps, self) => {
  if (!ps) {
    return Effect.void;
  }
  return Effect.asVoid(
    self._stream.offerAll(
      ps.map((p) => Progress.checkpoint(self.input.src, p)),
    ),
  );
});

export const addSnapshot = dual<
  (self: Envelope) => (snapshot: Hydrant.Snapshot) => Effect.Effect<Envelope>,
  (snapshot: Hydrant.Snapshot, self: Envelope) => Effect.Effect<Envelope>
>(2, (snapshot, self) =>
  pipe(
    self._stream.offer(
      Progress.checkpoint(self.input.src, snapshot),
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
    Effect.andThen(addSnapshot(snapshot, self)),
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
        Progress.checkpoint(self.input.src, snapshot),
        Progress.done(),
      ]),
    ),
    Effect.andThen(self._stream.end),
    Effect.andThen(SubscriptionRef.set(self.snapshots, snapshot)),
    Effect.as(self),
  ),
);

export const awaitFinal = (self: Envelope) => Deferred.await(self._final);

export const streamProgress = (self: Envelope) => self._stream.takeAll;

export const streamProgressWith = dual<
  <A, E, R>(f: (p: Progress.Progress) => Effect.Effect<A, E, R>) => (self: Envelope) => Effect.Effect<void, E, R>,
  <A, E, R>(self: Envelope, f: (p: Progress.Progress) => Effect.Effect<A, E, R>) => Effect.Effect<void, E, R>
>(2, (f, self) =>
  Effect.void,
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
