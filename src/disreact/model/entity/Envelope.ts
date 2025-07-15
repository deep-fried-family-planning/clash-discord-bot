import * as Elem from '#disreact/model/entity/Element.ts';
import type * as Fn from '#disreact/model/entity/Fn.ts';
import * as Polymer from '#disreact/model/entity/Polymer.ts';
import type * as Progress from '#disreact/core/Progress.ts';
import * as JsxRuntime from '#disreact/model/runtime/JsxRuntime.tsx';
import * as Deferred from 'effect/Deferred';
import * as E from 'effect/Effect';
import * as Inspectable from 'effect/Inspectable';
import * as Mailbox from 'effect/Mailbox';
import type * as Option from 'effect/Option';
import type * as Event from '#disreact/model/entity/Event.ts';

export interface Hydrant {
  entrypoint: string;
  props     : Record<string, any>;
  state     : Record<string, any>;
}

export interface Simulant<A = any> {
  data    : A;
  hydrant?: Hydrant;
  event?  : Event.EventInput;
}

export interface Simulated<T extends string, P = any> {
  type      : T;
  encoded   : P;
  entrypoint: Option.Option<string>;
  props     : Record<string, any>;
  state     : Record<string, any>;
}

export interface Envelope<A = any> extends Inspectable.Inspectable {
  data      : A;
  entrypoint: string | typeof JsxRuntime.Fragment;
  root      : Elem.Element;
  flags     : Set<Elem.Element>;
  final     : Deferred.Deferred<Progress.Checkpoint>;
  stream    : Mailbox.Mailbox<Progress.Progress>;
}

const Proto: Envelope = {
  data      : undefined as any,
  hydrant   : undefined as any,
  entrypoint: JsxRuntime.Fragment,
  root      : undefined as any,
  stream    : undefined as any,
  final     : undefined as any,
  flags     : undefined as any,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id       : 'Envelope',
      entrypoint: this.entrypoint,
      hydrant   : this.hydrant,
      root      : this.root,
      data      : this.data,
    };
  },
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

export const fromFC = (
  fc: Fn.FC,
  props: any,
  data: any,
) =>
  makeEffects.pipe(
    E.map((self) => {
      const jsx = JsxRuntime.makeJsx(fc, props);

      self.entrypoint = fc.entrypoint ?? JsxRuntime.Fragment;
      self.data = data;
      self.hydrant = Polymer.hydrant('', props);
      self.root = Elem.fromJsx(jsx, self);
      return self;
    }),
  );

export const fromJsx = (
  jsx: JsxRuntime.Jsx,
  data: any,
) =>
  makeEffects.pipe(
    E.map((self) => {
      self.entrypoint = jsx.entrypoint ?? JsxRuntime.Fragment;
      self.data = data;
      self.hydrant = Polymer.hydrant('');
      self.root = Elem.fromJsx(jsx, self);
      return self;
    }),
  );

export const fromSimulation = (
  entrypoint: JsxRuntime.Entrypoint,
  hydrant: Polymer.Hydrant,
  data: any,
) =>
  makeEffects.pipe(
    E.map((self) => {
      self.entrypoint = entrypoint.id;
      self.hydrant = hydrant;
      self.data = data;
      self.root = Elem.fromJsx(entrypoint.component, self);
      return self;
    }),
  );

export const forkFromEntrypoint = (self: Envelope, entrypoint: JsxRuntime.Entrypoint) => {
  const forked = Object.create(Proto) as Envelope;
  forked.entrypoint = entrypoint.id;
  forked.data = self.data;
  forked.hydrant = Polymer.hydrant(entrypoint.id);
  forked.root = Elem.fromJsx(entrypoint.component, self);
  forked.stream = self.stream;
  forked.final = self.final;
  forked.flags = new Set();
  return forked;
};
