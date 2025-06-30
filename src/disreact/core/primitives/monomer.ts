import type * as Polymer from '#src/disreact/core/Polymer.ts';
import * as proto from '#src/disreact/core/behaviors/proto.ts';
import {MONOMER_CONTEXT, MONOMER_EFFECT, MONOMER_MEMO, MONOMER_NONE, MONOMER_REF, MONOMER_STATE} from '#src/disreact/core/primitives/constants.ts';
import * as Pipeable from 'effect/Pipeable';
import * as Inspectable from 'effect/Inspectable';

const BasePrototype = proto.type<Polymer.BaseMonomer>({
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
});

const NonePrototype = proto.type<Polymer.NoneMonomer>({
  ...BasePrototype,
  _tag: MONOMER_NONE,
});

const StatePrototype = proto.type<Polymer.StateMonomer>({
  ...BasePrototype,
  _tag : MONOMER_STATE,
  state: undefined,
});

const EffectPrototype = proto.type<Polymer.EffectMonomer>({
  ...BasePrototype,
  _tag  : MONOMER_EFFECT,
  effect: undefined as any,
  deps  : undefined,
});

const RefPrototype = proto.type<Polymer.RefMonomer>({
  ...BasePrototype,
  _tag   : MONOMER_REF,
  current: undefined,
});

const MemoPrototype = proto.type<Polymer.MemoMonomer>({
  ...BasePrototype,
  _tag : MONOMER_MEMO,
  value: undefined,
  deps : undefined,
});

const ContextPrototype = proto.type<Polymer.ContextMonomer>({
  ...BasePrototype,
  _tag: MONOMER_CONTEXT,
});

export const none = (): Polymer.NoneMonomer => NonePrototype;

export const state = (state: any): Polymer.StateMonomer =>
  proto.init(StatePrototype, {
    state: state,
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
  proto.init(ContextPrototype, {

  });
