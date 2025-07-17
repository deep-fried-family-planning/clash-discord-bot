import type * as Polymer from '#disreact/model/Polymer.ts';
import type * as Jsx from '#disreact/model/runtime/Jsx.tsx';
import * as Equal from 'effect/Equal';
import {dual, hole} from 'effect/Function';
import * as GlobalValue from 'effect/GlobalValue';
import * as Hash from 'effect/Hash';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';
import * as PrimaryKey from 'effect/PrimaryKey';

export type Source = | Jsx.Jsx
                     | Jsx.FC;

export type Lookup = | Source
                     | string;

const lookupId = (lookup: Lookup | undefined) =>
  !lookup ? undefined :
  typeof lookup === 'string' ? lookup :
  typeof lookup === 'function' ? lookup.entrypoint :
  lookup.entrypoint;

export const symbol = Symbol('disreact/Hydrant');

const registry = GlobalValue
  .globalValue(
    Symbol.for('disreact/Hydrant/registry'),
    () => new Map<string, Source>(),
  );

export const isRegistered = (lookup: Lookup | undefined): lookup is NonNullable<Lookup> =>
  !lookup ? false :
  registry.has(lookupId(lookup)!);

export const register = <A extends Jsx.FC>(id: string, source: A): A => {
  if (registry.has(id)) {
    throw new Error(`Duplicate register: ${id}`);
  }
  registry.set(id, source); // todo
  return source;
};

export interface Hydrant extends Inspectable.Inspectable,
  Pipeable.Pipeable,
  Equal.Equal,
  PrimaryKey.PrimaryKey
{
  [symbol]: typeof symbol;
  id      : string | undefined;
  source  : Source;
  props   : any | undefined;
  state   : Polymer.Bundle;
}

export const isHydrant = (u: unknown): u is Hydrant =>
  u != null &&
  typeof u === 'object' &&
  symbol in u;

export const hasEmptyState = (u: unknown): u is Hydrant =>
  isHydrant(u)
  && Object.keys(u.state).length === 0;

export const hasKnownId = (u: unknown): u is Hydrant =>
  isHydrant(u) &&
  isRegistered(u.id);

export const hasKnownSource = (u: unknown): u is Hydrant =>
  isHydrant(u) &&
  isRegistered(u.source);

const Proto: Hydrant = {
  ...Inspectable.BaseProto,
  ...Pipeable.Prototype,
  [symbol]: symbol,
  id      : undefined,
  source  : undefined as any,
  props   : undefined,
  state   : undefined as any,
  [Hash.symbol]() {
    return hole();
  },
  [Equal.symbol]() {
    return hole();
  },
  [PrimaryKey.symbol]() {
    return hole();
  },
  toJSON() {
    return {
      _id   : 'Hydrant',
      id    : this.id,
      source: this.source,
      props : this.props,
      state : this.state,
    };
  },
};

export const fromSource = (
  source: Source,
  props: any,
  state: Polymer.Bundle = {},
) => {
  const self = Object.create(Proto) as Hydrant;
  self.source = source;
  self.props = structuredClone(props);
  self.state = structuredClone(state);

  if (!isRegistered(self.source)) {
    return self;
  }
  self.id = lookupId(source);

  if (registry.get(self.id!) !== self.source) {
    throw new Error(`Invalid entrypoint`);
  }
  return self;
};

export const fromLookupUnsafe = (
  lookup: Lookup,
  props: any,
  state: Polymer.Bundle = {},
) => {
  const id = lookupId(lookup);

  if (!isRegistered(id)) {
    throw new Error(`Unknown entrypoint: ${id}`);
  }
  if (props.children) {
    throw new Error('props.children is not rehydratable');
  }
  const self = Object.create(Proto) as Hydrant;
  self.id = id;
  self.source = registry.get(id)!;
  self.props = structuredClone(props);
  self.state = structuredClone(state);
  return self;
};

export const fromHydrant = (self: Hydrant): Hydrant => {
  return {
    ...self,
    props: structuredClone(self.props),
    state: {},
  };
};

export const removeState = dual<
  (id: string) => (self: Hydrant) => readonly Polymer.Monomer.Encoded[] | undefined,
  (self: Hydrant, id: string) => readonly Polymer.Monomer.Encoded[] | undefined
>(2, (self, id) => {
  const state = self.state[id];
  delete self.state[id];
  return state;
});

export const insertState = dual<
  (id: string, value: any) => (self: Hydrant) => Hydrant,
  (self: Hydrant, id: string, value: any) => Hydrant
>(3, (self, id, value) => {
  self.state[id] = value;
  return self;
});

export const setProps = dual<
  (props: any) => (self: Hydrant) => Hydrant,
  (self: Hydrant, props: any) => Hydrant
>(2, (self, props) => {
  self.props = structuredClone(props);
  return self;
});

export const setState = dual<
  (state: Polymer.Bundle) => (self: Hydrant) => Hydrant,
  (self: Hydrant, state: Polymer.Bundle) => Hydrant
>(2, (self, state) => {
  self.state = state;
  return self;
});
