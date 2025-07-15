import type * as Document from '#disreact/core/Document.ts';
import type * as Node from '#disreact/core/Element.ts';
import type {MONOMER_CONTEXTUAL, MONOMER_EFFECT, MONOMER_MEMO, MONOMER_NONE, MONOMER_REDUCER, MONOMER_REF} from '#disreact/core/immutable/constants.ts';
import type {MONOMER_STATE} from '#disreact/core/immutable/constants.ts';
import * as poly from '#disreact/core/internal/polymer.ts';
import type * as Traversable from '#disreact/core/Traversable.ts';
import type * as Fn from '#disreact/model/core/Fn.ts';
import type * as Elem from '#disreact/model/Elem.ts';
import type * as Jsx from '#disreact/model/runtime/Jsx.ts';
import type * as E from 'effect/Effect';
import * as Inspectable from 'effect/Inspectable';
import type * as Pipeable from 'effect/Pipeable';

export const NONE     = 1,
             REDUCER  = 2,
             EFFECTOR = 3,
             REF      = 3,
             MEMO     = 4,
             CONTEXT  = 5;

export type Monomer =
  | None
  | Reducer
  | Effect
  | Reference
  | Memo
  | Contextual;

const MonomerProto: Monomer = {
  _tag   : undefined as any,
  hydrate: false,
  ...Inspectable.BaseProto,
  toJSON(this: any) {
    return Inspectable.format({
      _id     : 'Monomer',
      _tag    : this._tag,
      hydrate : this.hydrate,
      changed : this.changed,
      state   : this.state,
      dispatch: this.dispatch,
      deps    : this.deps,
      current : this.current,
    });
  },
} as Monomer;

export interface None extends Inspectable.Inspectable {
  _tag   : typeof NONE;
  hydrate: boolean;
}

export const NoneProto: None = Object.assign(
  Object.create(MonomerProto),
  {
    _tag: NONE,
  },
);

export interface Reducer extends Inspectable.Inspectable {
  _tag    : typeof REDUCER;
  hydrate : boolean;
  changed : boolean;
  state   : any;
  dispatch: (action: any) => void;
}

export const ReducerProto: None = Object.assign(
  Object.create(MonomerProto),
  {
    _tag: REDUCER,
  },
);

export interface Effect extends Inspectable.Inspectable {
  _tag    : typeof EFFECTOR;
  hydrate : boolean;
  dispatch: Fn.Effector;
  deps    : any[] | undefined;
}

export const EffectProto: Effect = Object.assign(
  Object.create(MonomerProto),
  {
    _tag: EFFECTOR,
  },
);

export interface Reference extends Inspectable.Inspectable {
  _tag   : typeof REF;
  hydrate: boolean;
  current: any;
}

export const ReferenceProto: Reference = Object.assign(
  Object.create(MonomerProto),
  {
    _tag: REF,
  },
);

export interface Memo extends Inspectable.Inspectable {
  _tag   : typeof MEMO;
  hydrate: boolean;
  state  : any;
  deps   : any[] | undefined;
}

export const MemoProto: Memo = Object.assign(
  Object.create(MonomerProto),
  {
    _tag: MEMO,
  },
);

export interface Contextual extends Inspectable.Inspectable {
  _tag   : typeof CONTEXT;
  hydrate: boolean;
}

export const ContextProto: Contextual = Object.assign(
  Object.create(MonomerProto),
  {
    _tag: CONTEXT,
  },
);

export type Encoded =
  | typeof MONOMER_NONE
  | [typeof MONOMER_STATE, any]
  | [typeof MONOMER_REDUCER, any]
  | typeof MONOMER_EFFECT
  | [typeof MONOMER_EFFECT, any[]]
  | typeof MONOMER_REF
  | [typeof MONOMER_REF, any]
  | typeof MONOMER_MEMO
  | [typeof MONOMER_MEMO, any[]]
  | [typeof MONOMER_CONTEXTUAL];

export interface Polymer extends Inspectable.Inspectable,
  Pipeable.Pipeable,
  Traversable.Origin<Elem.Component>
{
  pc   : number;
  rc   : number;
  stack: Monomer[];
  queue: Effect[];
  flags: Set<any>;
}

const PolymerProto: Polymer = {
  pc   : 0,
  rc   : 0,
  stack: undefined as any,
  queue: undefined as any,
  flags: undefined as any,
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id  : 'Polymer',
      pc   : this.pc,
      rc   : this.rc,
      stack: this.stack,
      queue: this.queue,
    });
  },
} as Polymer;

export const make = (origin: Elem.Component): Polymer => {
  const self = Object.create(PolymerProto) as Polymer;
  self.origin = origin;
  self.stack = [];
  self.queue = [];
  self.flags = origin._env.flags;
  return self;
};

export const isStateless = (self: Polymer) => self.stack.length === 0;

export const isChanged = (self: Polymer) => {
  for (let i = 0; i < self.stack.length; i++) {
    const monomer = self.stack[i];

    if (monomer._tag === REDUCER) {
      if (monomer.changed) {
        return true;
      }
    }
  }
  return false;
};

export const isQueued = (self: Polymer) => self.queue.length === 0;

export const enqueue = (self: Polymer, monomer: Effect) => self.queue.push(monomer);

export const dequeue = (self: Polymer) => self.queue.shift()?.dispatch;

export const hydrate = (node: Node.Func, document: Document.Document, stack?: Encoded[]): Polymer => {
  const self = empty(node, document);
  if (!stack) {
    return self;
  }
  for (let i = 0; i < stack.length; i++) {
    self.stack.push(poly.hydrateMonomer(stack[i]));
  }
  return self;
};

export const commit = (self: Polymer): Polymer => {
  if (!self.stack.length) {
    self.origin!.component._state = false;
    return self;
  }
  for (let i = 0; i < self.stack.length; i++) {
    const monomer = self.stack[i];

    if (monomer._tag === REDUCER) {
      monomer.changed = false;
    }
  }
  return self;
};

export const dehydrate = (self: Polymer): Encoded[] => {
  const encoded = [] as Encoded[];

  for (let i = 0; i < self.stack.length; i++) {
    const monomer = self.stack[i];

    encoded.push(poly.dehydrateMonomer(monomer));
  }
  return encoded;
};

export const dispose = (self: Polymer) => {
  if (self.queue.length) {
    throw new Error('ope');
  }
  self.origin = undefined;
  (self.stack as any) = undefined;
  (self.queue as any) = undefined;
  (self.flags as any) = undefined;
};



export interface Hydrant extends Inspectable.Inspectable {
  id   : string;
  props: any;
  state: Record<string, Encoded[]>;
}

const HydrantProto: Hydrant = {
  id   : '',
  props: undefined as any,
  state: undefined as any,
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id  : 'Hydrant',
      id   : this.id,
      props: this.props,
      state: this.state,
    });
  },
};

export const hydrant = (id: string, props: any, state?: any) => {
  const self = Object.create(HydrantProto) as Hydrant;
  self.id   = id;
  self.props = props;
  self.state = state ?? {};
  return self;
};

export const fromHydrant = (hydrant: Hydrant, id: string): Polymer => {
  throw new Error();
};

export const intoHydrant = (self: Polymer, hydrant: Hydrant): Hydrant => {
  const encoded = [] as Encoded[];

  for (let i = 0; i < self.stack.length; i++) {
    const monomer = self.stack[i];
    encoded.push(poly.dehydrateMonomer(monomer));
  }
  hydrant.state[self.ancestor!.trie] = encoded;
  return hydrant;
};

export const next = (self: Polymer): Monomer => self.stack[self.pc];

export const advance = (self: Polymer) => {
  self.pc++;
};
