import * as Progress from '#disreact/core/Marker.ts';
import * as Patch from '#disreact/core/Patch.ts';
import type * as Polymer from '#disreact/engine/entity/Polymer.ts';
import {CONTEXT, EFFECT, MEMO, REF, STATE} from '#disreact/engine/entity/Polymer.ts';
import * as Entrypoint from '#disreact/engine/runtime/Entrypoint.ts';
import * as Jsx from '#disreact/engine/entity/Jsx.tsx';
import {declareProto, declareSubtype, fromProto} from '#disreact/util/proto.ts';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import * as Equal from 'effect/Equal';
import {dual} from 'effect/Function';
import * as Inspectable from 'effect/Inspectable';
import * as Option from 'effect/Option';
import * as Pipeable from 'effect/Pipeable';
import type * as Record from 'effect/Record';
import * as S from 'effect/Schema';

export class SourceError extends Data.TaggedError('SourceError')<{
  message: string;
}>
{}

export interface Hydrant extends Inspectable.Inspectable, Pipeable.Pipeable {
  reg  : boolean;
  src  : string;
  entry: Jsx.Jsx;
  props: Record<string, any>;
  state: Record<string, Polymer.Dehydrated>;
}

const HydrantProto = declareProto<Hydrant>({
  reg  : false,
  src  : '',
  entry: undefined as any,
  props: undefined as any,
  state: undefined as any,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id  : 'Hydrant',
      src  : Entrypoint.getId(this.entry),
      props: this.props,
      state: this.state,
      entry: this.entry,
    };
  },
});

export const make = (entry: Entrypoint.Entrypoint, setup?: any) => {
  if (typeof entry === 'function') {
    const self = fromProto(HydrantProto);
    self.src = Entrypoint.getId(entry) ?? String(self.entry.type);
    self.props = structuredClone(setup ?? {});
    self.entry = Jsx.component(entry, self.props);
    self.state = {};
    return self;
  }
  const self = fromProto(HydrantProto);
  self.src = Entrypoint.getId(entry) ?? String(self.entry.type);
  self.props = structuredClone(entry.props);
  self.entry = Jsx.clone(entry);
  self.state = {};
  return self;
};

export const unsafeFromRegistry = (entry: Entrypoint.Lookup, setup?: any): Hydrant => {
  if (!Entrypoint.isRegistered(entry)) {
    throw new Error(`Source (${entry}) is not registered.`);
  }
  const src = Entrypoint.get(entry);
  const self = make(src, setup);
  self.src = Entrypoint.getId(src)!;
  self.reg = true;
  return self;
};

export const fromRegistry = (entry: Entrypoint.Lookup, setup?: any): Effect.Effect<Hydrant, SourceError> => {
  if (!Entrypoint.isRegistered(entry)) {
    return new SourceError({
      message: `Source (${entry}) is not registered.`,
    });
  }
  const src = Entrypoint.get(entry);
  const self = make(src, setup);
  self.src = Entrypoint.getId(src)!;
  self.reg = true;
  return Effect.succeed(self);
};

export const fromHydrator = (hydrator: Hydrator): Effect.Effect<Hydrant, SourceError> => {
  if (!Entrypoint.isRegistered(hydrator.src)) {
    return new SourceError({
      message: `Source (${hydrator.src}) is not registered.`,
    });
  }
  const src = Entrypoint.get(hydrator.src);
  const self = make(src, hydrator.props);
  self.reg = true;
  self.state = structuredClone(hydrator.state);
  return Effect.succeed(self);
};

export const hasStates = (self: Hydrant) => Object.keys(self.state).length > 0;

export type HydrantPatch = | Patch.Skip<Hydrant>
                           | Patch.Remove<Hydrant>
                           | Patch.Replace<Hydrant>
                           | Patch.Update<Hydrant>;

export const diff = dual<
  (that: Option.Option<Hydrant>) => (self: Hydrant) => readonly [HydrantPatch, Progress.Change],
  (self: Hydrant, that: Option.Option<Hydrant>) => readonly [HydrantPatch, Progress.Change]
>(2, (self, opt) => {
  if (Option.isNone(opt)) {
    return [
      Patch.remove(self),
      Progress.change(self.src!, 'Exit'),
    ];
  }
  if (Equal.equals(self, opt.value)) {
    return [
      Patch.skip(self),
      Progress.change(self.src!, 'Same'),
    ];
  }
  if (self.src === opt.value.src) {
    return [
      Patch.update(self, opt.value),
      Progress.change(self.src!, 'Same'),
    ];
  }
  return [
    Patch.replace(self, opt.value),
    Progress.change(self.src!, 'Next'),
  ];
});

export interface Hydrator extends Inspectable.Inspectable, Pipeable.Pipeable {
  src  : string | undefined;
  props: Record<string, any>;
  state: Record<string, Polymer.Dehydrated>;
}

export const HydratorPrototype = declareProto<Hydrator>({
  src  : undefined,
  props: undefined as any,
  state: undefined as any,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id  : 'Hydrator',
      src  : this.src,
      props: this.props,
      state: this.state,
    };
  },
});

export const toHydrator = (hydrant: Hydrant) => {
  const self = fromProto(HydratorPrototype);
  if (!hydrant.reg) {
    self.src = undefined;
  }
  else {
    self.src = Entrypoint.getId(hydrant.entry);
  }
  self.props = structuredClone(hydrant.props);
  self.state = {};
  return self;
};

export const hydrator = (id: Entrypoint.Lookup, props?: any, state?: Polymer.Bundle) => {
  const self = fromProto(HydratorPrototype);
  self.src = Entrypoint.getId(id);
  self.props = structuredClone(props ?? {});
  self.state = structuredClone(state ?? {});
  return self;
};

export interface Snapshot<T = any, P = any> extends Hydrator {
  type   : T;
  payload: P;
}

const SnapshotProto = declareSubtype<Snapshot, Hydrator>(HydratorPrototype, {
  type   : '',
  payload: undefined,
  toJSON() {
    return {
      _id    : 'Snapshot',
      source : this.src,
      type   : this.type,
      payload: this.payload,
      props  : this.props,
      state  : this.state,
    };
  },
});

export const toSnapshot = dual<
  <A, B>(type: A, payload: B) => (h: Hydrator) => Snapshot<A, B>,
  <A, B>(h: Hydrator, type: A, payload: B) => Snapshot<A, B>
>(3, (h, type, payload) => {
  const self = fromProto(SnapshotProto);
  self.type = type;
  self.payload = payload;
  self.src = h.src;
  self.props = h.props;
  self.state = h.state;
  return self;
});

export interface Event<A = any> {
  id    : string;
  type  : string;
  target: A;
}

const Monomer = S.Union(
  S.Tuple(S.Literal(STATE), S.Array(S.Any)),
  S.Literal(EFFECT),
  S.Tuple(S.Literal(EFFECT), S.Array(S.Any)),
  S.Literal(REF),
  S.Tuple(S.Literal(REF), S.Any),
  S.Literal(MEMO),
  S.Tuple(S.Literal(MEMO), S.Array(S.Any)),
  S.Literal(CONTEXT),
);

export const Hydrator = S.Struct({
  src  : S.String,
  props: S.Record({
    key  : S.String,
    value: S.Any,
  }),
  state: S.Record({
    key  : S.String,
    value: S.Array(Monomer),
  }),
});
