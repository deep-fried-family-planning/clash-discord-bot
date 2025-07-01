import {MONOMER_CONTEXTUAL, MONOMER_EFFECT, MONOMER_MEMO, MONOMER_NONE, MONOMER_REDUCER, MONOMER_REF, MONOMER_STATE} from '#disreact/core/primitives/constants.ts';
import * as Lateral from '#src/disreact/core/behaviors/lateral.ts';
import * as Lineage from '#src/disreact/core/behaviors/lineage.ts';
import * as proto from '#src/disreact/core/behaviors/proto.ts';
import type * as Polymer from '#src/disreact/core/Polymer.ts';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';

const BasePrototype = proto.type<Polymer.BaseMonomer>({
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
});

const NonePrototype = proto.type<Polymer.NoneMonomer>({
  ...BasePrototype,
  _tag: MONOMER_NONE,
  toJSON() {
    return Inspectable.format({
      _id: 'None',
    });
  },
});

const StatePrototype = proto.type<Polymer.StateMonomer>({
  ...BasePrototype,
  _tag : MONOMER_STATE,
  state: undefined,
  toJSON() {
    return Inspectable.format({
      _id  : 'State',
      state: this.state,
    });
  },
});

const ReducerPrototype = proto.type<Polymer.ReducerMonomer>({
  ...BasePrototype,
  _tag : MONOMER_REDUCER,
  state: undefined,
  toJSON() {
    return Inspectable.format({
      _id  : 'Reducer',
      state: this.state,
    });
  },
});

const EffectPrototype = proto.type<Polymer.EffectMonomer>({
  ...BasePrototype,
  _tag  : MONOMER_EFFECT,
  effect: undefined as any,
  deps  : undefined,
  toJSON() {
    return Inspectable.format({
      _id : 'Effect',
      deps: this.deps,
    });
  },
});

const RefPrototype = proto.type<Polymer.RefMonomer>({
  ...BasePrototype,
  _tag   : MONOMER_REF,
  current: undefined,
  toJSON() {
    return Inspectable.format({
      _id    : 'Ref',
      current: this.current,
    });
  },
});

const MemoPrototype = proto.type<Polymer.MemoMonomer>({
  ...BasePrototype,
  _tag : MONOMER_MEMO,
  value: undefined,
  deps : undefined,
  toJSON() {
    return Inspectable.format({
      _id : 'Memo',
      deps: this.deps,
    });
  },
});

const ContextPrototype = proto.type<Polymer.ContextMonomer>({
  ...BasePrototype,
  _tag: MONOMER_CONTEXTUAL,
  toJSON() {
    return Inspectable.format({
      _id: 'Context',
    });
  },
});

export const none = (): Polymer.NoneMonomer => NonePrototype;

export const state = (state: any): Polymer.StateMonomer =>
  proto.init(StatePrototype, {
    state: state,
  });

export const reducer = (state: any, fn: any): Polymer.ReducerMonomer =>
  proto.init(ReducerPrototype, {
    state  : state,
    changed: false,
    reducer: fn,
  });

export const effect = (effect: any, deps: any): Polymer.EffectMonomer =>
  proto.init(EffectPrototype, {
    effect: effect,
    deps  : deps,
  });

export const ref = (current: any): Polymer.RefMonomer =>
  proto.init(RefPrototype, {
    current: current,
  });

export const memo = (value: any, deps: any): Polymer.MemoMonomer =>
  proto.init(MemoPrototype, {
    value: value,
    deps : deps,
  });

export const context = (): Polymer.ContextMonomer =>
  proto.init(ContextPrototype, {});

const Prototype = proto.type<Polymer.Polymer>({
  pc: 0,
  rc: 0,
  ...Lineage.Prototype,
  ...Lateral.Prototype,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id  : 'Polymer',
      pc   : this.pc,
      rc   : this.rc,
      stack: this.stack,
    });
  },
});

export const empty = () =>
  proto.init(Prototype, {
    stack: [],
  });

export const pull = (self: Polymer.Polymer): Polymer.Monomer | undefined => self.stack[self.pc];

export const push = (self: Polymer.Polymer, monomer: Polymer.Monomer) => {
  self.stack.push(monomer);
  self.pc++;
};

export const defineHook = () => {};
