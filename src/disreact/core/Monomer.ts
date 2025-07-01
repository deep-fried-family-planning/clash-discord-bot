import * as proto from '#disreact/core/behaviors/proto.ts';
import type * as Polymer from '#disreact/core/Polymer.ts';
import {MONOMER_CONTEXTUAL, MONOMER_EFFECT, MONOMER_MEMO, MONOMER_NONE, MONOMER_REDUCER, MONOMER_REF, MONOMER_STATE, type MonomerTag} from '#disreact/core/immutable/constants.ts';
import * as Inspectable from 'effect/Inspectable';

interface Base extends Inspectable.Inspectable {
  _tag    : MonomerTag;
  hydrate?: boolean;
  changed?: boolean;
  state?  : any;
  deps?   : any[] | undefined;
  fn?     : Polymer.EffectFn;
  fx?     : Polymer.Effect;
  current?: any;
  value?  : any;
}

export interface None extends Base {
  _tag: typeof MONOMER_NONE;
}

export interface Stateful extends Base {
  _tag   : typeof MONOMER_STATE;
  changed: boolean;
  state  : any;
  updater(next: any): void;
}

export interface Reducer extends Base {
  _tag   : typeof MONOMER_REDUCER;
  changed: boolean;
  state  : any;
  reducer(state: any, action: any): any;
}

export interface Effectful extends Base {
  _tag: typeof MONOMER_EFFECT;
  deps: any[] | undefined;
  fn?(): Polymer.EffectOutput;
  fx? : Polymer.Effect;
}

export interface Reference extends Base {
  _tag   : typeof MONOMER_REF;
  current: any;
}

export interface Memoize extends Base {
  _tag : typeof MONOMER_MEMO;
  value: any;
  deps : any[] | undefined;
}

export interface Contextual extends Base {
  _tag: typeof MONOMER_CONTEXTUAL;
}

export type Monomer = | None
                      | Stateful
                      | Reducer
                      | Effectful
                      | Reference
                      | Memoize
                      | Contextual;

const Prototype = proto.type<Base>({
  _tag   : undefined as any,
  state  : undefined as any,
  changed: undefined as any,
  current: undefined as any,
  deps   : undefined as any,
  fn     : undefined as any,
  fx     : undefined as any,
  value  : undefined as any,
  ...Inspectable.BaseProto,
  toJSON() {
    switch (this._tag) {
      case MONOMER_NONE: {
        return Inspectable.format({
          _id: 'None',
        });
      }
      case MONOMER_STATE: {
        return Inspectable.format({
          _id  : 'State',
          state: this.state,
        });
      }
      case MONOMER_REDUCER: {
        return Inspectable.format({
          _id  : 'Reducer',
          state: this.state,
        });
      }
      case MONOMER_EFFECT: {
        return Inspectable.format({
          _id : 'Effect',
          deps: this.deps,
        });
      }
      case MONOMER_REF: {
        return Inspectable.format({
          _id    : 'Ref',
          current: this.current,
        });
      }
      case MONOMER_MEMO: {
        return Inspectable.format({
          _id : 'Memo',
          deps: this.deps,
        });
      }
      case MONOMER_CONTEXTUAL: {
        return Inspectable.format({
          _id: 'Context',
        });
      }
    }
  },
});

export const none = (): None =>
  proto.init(Prototype, {
    _tag: MONOMER_NONE,
  }) as None;

export const stateful = (hydrate: boolean, state: any): Stateful =>
  proto.init(Prototype, {
    _tag   : MONOMER_STATE,
    hydrate: hydrate,
    state  : state,
  }) as Stateful;

export const reducer = (hydrate: boolean, state: any): Reducer =>
  proto.init(Prototype, {
    _tag   : MONOMER_REDUCER,
    hydrate: hydrate,
    state  : state,
  }) as Reducer;

export const effectful = (hydrate: boolean, deps?: any[] | undefined): Effectful =>
  proto.init(Prototype, {
    _tag   : MONOMER_EFFECT,
    hydrate: hydrate,
    deps,
  }) as Effectful;

export const reference = (hydrate: boolean, current?: any): Reference =>
  proto.init(Prototype, {
    _tag   : MONOMER_REF,
    hydrate: hydrate,
    current: current,
  }) as Reference;

export const memoize = (hydrate: boolean, deps?: any[] | undefined): Memoize =>
  proto.init(Prototype, {
    _tag   : MONOMER_MEMO,
    hydrate: hydrate,
    deps   : deps,
  }) as Memoize;

export const contextual = (hydrate: boolean): Contextual =>
  proto.init(Prototype, {
    _tag   : MONOMER_CONTEXTUAL,
    hydrate: hydrate,
  }) as Contextual;

export const isChanged = (monomer: Monomer): boolean => {
  switch (monomer._tag) {
    case MONOMER_STATE:
    case MONOMER_REDUCER: {
      return monomer.changed;
    }
  }
  return false;
};

export type Encoded = | typeof MONOMER_NONE
                      | [typeof MONOMER_STATE, any]
                      | [typeof MONOMER_REDUCER, any]
                      | typeof MONOMER_EFFECT
                      | [typeof MONOMER_EFFECT, any[]]
                      | typeof MONOMER_REF
                      | [typeof MONOMER_REF, any]
                      | typeof MONOMER_MEMO
                      | [typeof MONOMER_MEMO, any[]]
                      | [typeof MONOMER_CONTEXTUAL];

export const hydrateMonomer = (monomer: Encoded): Monomer => {
  if (monomer === MONOMER_NONE) {
    return none();
  }
  if (monomer === MONOMER_EFFECT) {
    return effectful(true);
  }
  if (monomer === MONOMER_REF) {
    return reference(true);
  }
  if (monomer === MONOMER_MEMO) {
    return memoize(true);
  }
  switch (monomer[0]) {
    case MONOMER_STATE: {
      return stateful(true, monomer[1]);
    }
    case MONOMER_REDUCER: {
      return reducer(true, monomer[1]);
    }
    case MONOMER_EFFECT: {
      return effectful(true, monomer[1]);
    }
    case MONOMER_REF: {
      return reference(true, monomer[1]);
    }
    case MONOMER_MEMO: {
      return memoize(true, monomer[1]);
    }
    case MONOMER_CONTEXTUAL: {
      return contextual(true);
    }
  }
};

export const dehydrateMonomer = (self: Monomer): Encoded => {
  switch (self._tag) {
    case MONOMER_NONE: {
      return MONOMER_NONE;
    }
    case MONOMER_STATE: {
      return [MONOMER_STATE, self.state];
    }
    case MONOMER_REDUCER: {
      return [MONOMER_REDUCER, self.state];
    }
    case MONOMER_EFFECT: {
      if (self.deps === undefined) {
        return MONOMER_EFFECT;
      }
      return [MONOMER_EFFECT, self.deps];
    }
    case MONOMER_REF: {
      if (typeof self.current === 'function') {
        return MONOMER_REF;
      }
      return [MONOMER_REF, self.current];
    }
    case MONOMER_MEMO: {
      if (self.deps === undefined) {
        return MONOMER_MEMO;
      }
      return [MONOMER_MEMO, self.deps];
    }
    case MONOMER_CONTEXTUAL: {
      return [MONOMER_CONTEXTUAL];
    }
  }
};
