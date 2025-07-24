import type * as Polymer from '#disreact/model/entity/Polymer.ts';
import * as Jsx from '#disreact/model/entity/Jsx.tsx';
import * as Equal from 'effect/Equal';
import {dual, hole} from 'effect/Function';
import * as GlobalValue from 'effect/GlobalValue';
import * as Hash from 'effect/Hash';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';
import * as PrimaryKey from 'effect/PrimaryKey';
import * as equivalence from 'effect/Equivalence';

export type Source = | Jsx.Jsx
                     | Jsx.FC;

export type Lookup = | Source
                     | string;

const lookupId = (lookup: Lookup | undefined) =>
  !lookup ? undefined :
  typeof lookup === 'string' ? lookup :
  typeof lookup === 'function' ? lookup.entrypoint :
  lookup.entrypoint;

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

export const symbol = Symbol('disreact/Hydrant');

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

export const Equivalence = equivalence.make<Hydrant>(
  (a, b) => {
    if (a === b) {
      return true;
    }
    if (!a.id || !b.id) {
      return false;
    }
    return a.id === b.id;
  },
);

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
  [Equal.symbol](this, that: Hydrant) {
    return Equivalence(this, that);
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
  props?: any,
  state?: Polymer.Bundle,
): Hydrant => {
  const self = Object.create(Proto) as Hydrant;
  self.source = source;
  self.props = structuredClone(props);
  self.state = structuredClone(state ?? {});

  if (!isRegistered(self.source)) {
    return self;
  }
  self.id = lookupId(source);

  if (registry.get(self.id!) !== self.source) {
    throw new Error(`Invalid entrypoint`);
  }
  return self;
};

export const fromLookup = (
  lookup: Lookup,
  props: any,
  state: Polymer.Bundle = {},
): Hydrant => {
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
  if (props.children) {
    throw new Error('props.children is not rehydratable');
  }
  self.props = structuredClone(props);
  return self;
});

export const setState = dual<
  (state: Polymer.Bundle) => (self: Hydrant) => Hydrant,
  (self: Hydrant, state: Polymer.Bundle) => Hydrant
>(2, (self, state) => {
  self.state = structuredClone(state);
  return self;
});

export interface Encoded {
  id   : string;
  state: Polymer.Bundle;
  props: any;
}

export const fromEncoded = (encoded: Encoded) => fromLookup(encoded.id, encoded.props, encoded.state);

export const toEncoded = (self: Hydrant): Encoded | undefined =>
  !self.id ? undefined :
  ({
    id   : self.id!,
    state: structuredClone(self.state),
    props: structuredClone(self.props),
  });

export const toSource = (self: Hydrant): Source =>
  self.source;

export const toJsx = (self: Hydrant): Jsx.Jsx => {
  if (typeof self.source === 'function') {
    return Jsx.makeJsx(self.source, self.props, self.id);
  }
  return Jsx.clone(self.source);
};

export interface EncodedEvent {
  _tag: 'Step' | 'Custom';
  id  : string;
  type: string;
  data: any;
}

export const makeEvent = (event: EncodedEvent): EncodedEvent => event;
