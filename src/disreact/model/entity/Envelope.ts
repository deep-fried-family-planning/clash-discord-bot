import type * as Progress from '#disreact/core/Progress.ts';
import * as Element from '#disreact/model/entity/Element.ts';
import type * as Event from '#disreact/model/entity/Event.ts';
import type * as Hydrant from '#disreact/model/entity/Hydrant.ts';
import * as Polymer from '#disreact/model/entity/Polymer.ts';
import * as JsxRuntime from '#disreact/model/runtime/Jsx.tsx';
import * as Jsx from '#disreact/model/runtime/Jsx.tsx';
import * as Deferred from 'effect/Deferred';
import * as Effect from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as Inspectable from 'effect/Inspectable';
import * as Mailbox from 'effect/Mailbox';
import * as Option from 'effect/Option';

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
  data   : A;
  hydrant: Hydrant.Hydrant;
  root   : Element.Element;
  flags  : Set<Element.Element>;
  final  : Deferred.Deferred<Progress.Checkpoint>;
  stream : Mailbox.Mailbox<Progress.Progress>;
}

const toRoot = (self: Envelope) =>
    Option.getOrThrow(
      Option.fromNullable(self.root),
    );

const Proto: Envelope = {
  data   : undefined as any,
  hydrant: undefined as any,
  root   : undefined as any,
  stream : undefined as any,
  final  : undefined as any,
  flags  : undefined as any,
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

const jsxOption = Option.liftPredicate(Jsx.isJsx);
const fcOption = Option.liftPredicate(Jsx.isFC);

const makeRoot = (self: Envelope) =>
  Option.some(self.hydrant.source).pipe(
    Option.flatMap(jsxOption),
    Option.orElse(() => Option.some(self.hydrant.source)),
  );

export const fromHydrant = (hydrant: Hydrant.Hydrant, data: any) =>
  make.pipe(Effect.map((self) => {
    self.data = data;
    self.hydrant = hydrant;
    // self.root
    return self;
  }));

export const fromSourceFC = (
  fc: Fn.FC,
  props: any,
  data: any,
) =>
  make.pipe(
    Effect.map((self) => {
      const jsx = JsxRuntime.makeJsx(fc, props);
    }),
  );

export const fromSourceJsx = () => {

};

export const fromFC = (
  fc: Fn.FC,
  props: any,
  data: any,
) =>
  make.pipe(
    Effect.map((self) => {
      const jsx = JsxRuntime.makeJsx(fc, props);

      self.entrypoint = fc.entrypoint ?? JsxRuntime.Fragment;
      self.data = data;
      self.hydrant = Polymer.hydrant('', props);
      self.root = Element.makeRoot(jsx, self);
      return self;
    }),
  );

export const fromJsx = (
  jsx: JsxRuntime.Jsx,
  data: any,
) =>
  make.pipe(
    Effect.map((self) => {
      self.entrypoint = jsx.entrypoint ?? JsxRuntime.Fragment;
      self.data = data;
      self.hydrant = Polymer.hydrant('');
      self.root = Element.makeRoot(jsx, self);
      return self;
    }),
  );

export const fromSimulation = (
  entrypoint: JsxRuntime.Entrypoint,
  hydrant: Polymer.Hydrant,
  data: any,
) =>
  make.pipe(
    Effect.map((self) => {
      self.entrypoint = entrypoint.id;
      self.hydrant = hydrant;
      self.data = data;
      self.root = Element.makeRoot(entrypoint.component, self);
      return self;
    }),
  );

export const forkFromEntrypoint = (self: Envelope, entrypoint: JsxRuntime.Entrypoint) => {
  const forked = Object.create(Proto) as Envelope;
  forked.entrypoint = entrypoint.id;
  forked.data = self.data;
  forked.hydrant = Polymer.hydrant(entrypoint.id);
  forked.root = Element.makeRoot(entrypoint.component, self);
  forked.stream = self.stream;
  forked.final = self.final;
  forked.flags = new Set();
  return forked;
};

export const dispose = (self: Envelope) =>
  Effect.asVoid(
    Effect.die('Not Implemented'),
  );
