import * as Elem from '#disreact/model/entity/Elem.ts';
import type * as Fn from '#disreact/model/core/Fn.ts';
import * as Polymer from '#disreact/model/core/Polymer.ts';
import type * as Progress from '#disreact/model/core/Progress.ts';
import * as Jsx from '#disreact/model/runtime/Jsx.tsx';
import * as Deferred from 'effect/Deferred';
import * as E from 'effect/Effect';
import * as Inspectable from 'effect/Inspectable';
import * as Mailbox from 'effect/Mailbox';
import * as Option from 'effect/Option';
import type * as Event from '#disreact/model/entity/Event.ts';

export interface Envelope<A = any> extends Inspectable.Inspectable {
  data      : A;
  hydrant   : Polymer.Hydrant;
  event     : Option.Option<Event.Event>;
  entrypoint: Option.Option<Jsx.Entrypoint>;
  root      : Elem.Elem;
  roots     : Elem.Elem[];
  flags     : Set<Elem.Elem>;
  final     : Deferred.Deferred<Progress.Checkpoint>;
  stream    : Mailbox.Mailbox<Progress.Progress>;
}

const Proto: Envelope = {
  data      : undefined as any,
  hydrant   : undefined as any,
  event     : Option.none(),
  entrypoint: Option.none(),
  root      : undefined as any,
  roots     : undefined as any,
  stream    : undefined as any,
  final     : undefined as any,
  flags     : undefined as any,
  ...Inspectable.BaseProto,
};

const makeEffects = E.all([
  Deferred.make<Progress.Checkpoint>(),
  Mailbox.make<Progress.Progress>(),
]).pipe(
  E.map(([final, stream]) => {
    const self = Object.create(Proto) as Envelope;
    self.stream = stream;
    self.final = final;
    self.flags = new Set();
    return self;
  }),
);

export const make = (

) =>
  makeEffects.pipe(
    E.map((self) => {
      self.hydrant = Polymer.hydrant('', {});
      self.root = Elem.fromEntrypoint();
    }),
  );

export const fromFC = (
  fc: Fn.JsxFC,
  props: any,
  data: any,
) =>
  makeEffects.pipe(
    E.map((self) => {
      self.data = data;
      self.hydrant = Polymer.hydrant('', {});
      self.root = Elem.fromJsx(Jsx.make(fc, props), self);
      return self;
    }),
  );

export const fromElement = (
  root: Elem.Elem,
  data: any,
  event?: any,
  entrypoint?: Jsx.Entrypoint,
) =>
  makeEffects.pipe(
    E.map((self) => {
      self.event = Option.fromNullable(event);
      self.entrypoint = Option.fromNullable(entrypoint);
      self.root = root;
      self.data = data;
      return self;
    }),
  );

export const fromSimulation = (
  hydrant: Polymer.Hydrant,
  data: any,
  event?: any,
) =>
  makeEffects.pipe(
    E.map((self) => {
      self.hydrant = hydrant;
      self.data = data;
      self.event = Option.fromNullable(event);
      self.root = Elem.fromEntrypoint();
      return self;
    }),
  );
