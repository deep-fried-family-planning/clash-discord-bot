import * as proto from '#disreact/core/behaviors/proto.ts';
import type * as Document from '#disreact/core/Document.ts';
import type * as Node from '#disreact/core/Element.ts';
import {MONOMER_CONTEXTUAL, MONOMER_EFFECT, MONOMER_MEMO, MONOMER_NONE, MONOMER_REDUCER, MONOMER_REF, MONOMER_STATE} from '#disreact/core/immutable/constants.ts';
import type * as Polymer from '#disreact/model/entity/Polymer.ts';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';

const Prototype = proto.type<Polymer.Polymer>({
  rc: 0,
  pc: 0,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id  : 'Polymer',
      pc   : this.pc,
      rc   : this.rc,
      stack: this.stack,
    };
  },
});

export const empty = (node: Node.Func, document: Document.Document): Polymer.Polymer =>
  proto.init(Prototype, {
    origin  : document,
    ancestor: node,
    stack   : [],
    queue   : [],
  });

export const isStateless = (self: Polymer.Polymer) => self.stack.length === 0;

export const push = (self: Polymer.Polymer, monomer: Polymer.Monomer) => {
  self.stack.push(monomer);
  self.pc++;
};

export const pull = (self: Polymer.Polymer): Polymer.Monomer | undefined => {
  const monomer = self.stack.at(self.pc);
  if (!monomer) {
    return undefined;
  }
  self.pc++;
  return monomer;
};

export const hasEffects = (self: Polymer.Polymer) => self.queue.length > 0;

export const enqueue = (self: Polymer.Polymer, monomer: Polymer.Effect) => {
  self.queue.push(monomer);
};

export const dequeue = (self: Polymer.Polymer): Polymer.Effect => {
  return self.queue.shift()!;
};

const MonomerPrototype = proto.type<Polymer.Monomer>({
  _tag   : undefined as any,
  state  : undefined as any,
  changed: undefined as any,
  current: undefined as any,
  deps   : undefined as any,
  fn     : undefined as any,
  fx     : undefined as any,
  value  : undefined as any,
  ...Inspectable.BaseProto,
  toJSON,
});

export const none = (): Polymer.None =>
  proto.init(MonomerPrototype, {
    _tag: MONOMER_NONE,
  }) as Polymer.None;

export const stateful = (hydrate: boolean, state: any): Polymer.Stateful =>
  proto.init(MonomerPrototype, {
    _tag   : MONOMER_STATE,
    hydrate: hydrate,
    state  : state,
  }) as Polymer.Stateful;

export const reducer = (hydrate: boolean, state: any): Polymer.Reducer =>
  proto.init(MonomerPrototype, {
    _tag   : MONOMER_REDUCER,
    hydrate: hydrate,
    state  : state,
  }) as Polymer.Reducer;

export const effectful = (hydrate: boolean, deps?: any[] | undefined): Polymer.Effect =>
  proto.init(MonomerPrototype, {
    _tag   : MONOMER_EFFECT,
    hydrate: hydrate,
    deps,
  }) as Polymer.Effect;

export const reference = (hydrate: boolean, current?: any): Polymer.Reference =>
  proto.init(MonomerPrototype, {
    _tag   : MONOMER_REF,
    hydrate: hydrate,
    current: current,
  }) as Polymer.Reference;

export const memoize = (hydrate: boolean, deps?: any[] | undefined): Polymer.Memo =>
  proto.init(MonomerPrototype, {
    _tag   : MONOMER_MEMO,
    hydrate: hydrate,
    deps   : deps,
  }) as Polymer.Memo;

export const contextual = (hydrate: boolean): Polymer.Contextual =>
  proto.init(MonomerPrototype, {
    _tag   : MONOMER_CONTEXTUAL,
    hydrate: hydrate,
  }) as Polymer.Contextual;

export const isChanged = (monomer: Polymer.Monomer): boolean => {
  switch (monomer._tag) {
    case MONOMER_STATE:
    case MONOMER_REDUCER: {
      return monomer.changed;
    }
  }
  return false;
};

export const hydrateMonomer = (monomer: Polymer.Encoded): Polymer.Monomer => {
  switch (monomer) {
    case MONOMER_NONE: {
      return none();
    }
    case MONOMER_EFFECT: {
      return effectful(true);
    }
    case MONOMER_REF: {
      return reference(true);
    }
    case MONOMER_MEMO: {
      return memoize(true);
    }
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

export const dehydrateMonomer = (self: Polymer.Monomer): Polymer.Encoded => {
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

export const dispose = (self: Polymer.Polymer) => {
  for (const monomer of self.stack) {
    switch (monomer._tag) {
      case MONOMER_STATE: {
        continue;
      }
    }
  }
  if (self.queue.length) {
    throw new Error();
  }
  self.origin = undefined;
  self.ancestor = undefined;
  (self.stack as any) = undefined;
  (self.queue as any) = undefined;
  return self;
};

function toJSON(this: Polymer.Monomer) {
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
}
