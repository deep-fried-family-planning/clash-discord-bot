import * as Polymer from '#disreact/model/internal/Polymer.ts';
import {EFFECT, HookError, REF, STATE} from '#disreact/model/internal/Polymer.ts';
import type * as Effect from 'effect/Effect';
import * as MutableRef from 'effect/MutableRef';

export type UseReducer = <S, A>(reducer: (state: S, action: A) => S, initial: S | (() => S)) =>
  readonly [S, (action: A) => void];

export type UseState = <A>(initial: A | (() => A)) =>
    readonly [A, (next: A | ((prev: A) => A)) => void];

export type UseEffect = <E = never, R = never>(
  effect: | (() => void)
          | (() => Promise<void>)
          | (() => Effect.Effect<void, E, R>)
          | Effect.Effect<void, E, R>,
  deps?: any[],
) => void;

export type UseRef = <A>(initial: A | (() => A)) =>
  MutableRef.MutableRef<A>;

export const interaction = (p: Polymer.Polymer) => () => p.origin!.env.data;

export const reducer = (p: Polymer.Polymer): UseReducer => (reducer: any, initial: any) => {
  const m = p.stack[p.pc];
  if (m) {
    if (m._tag !== STATE) {
      throw new HookError('Hooks must be called in the same order');
    }
    p.pc++;
    return [m.state, m.update];
  }
  const init = Polymer.reducer();

  if (typeof initial === 'function') {
    init.state = initial();
  }
  else {
    init.state = initial;
  }
  init.update = (action: any) => {
    init.state = reducer(init.state, action);
    init.changed = true;
    p.flag();
  };

  p.stack[p.pc] = init;
  p.pc++;
  return [init.state, init.update];
};

export const state = (polymer: Polymer.Polymer): UseState => (initial: any) => {
  const m = polymer.stack[polymer.pc];
  if (m) {
    if (m._tag !== STATE) {
      throw new HookError('Hooks must be called in the same order');
    }
    polymer.pc++;
    return [m.state, m.update];
  }
  const init = Polymer.reducer();

  if (typeof initial === 'function') {
    init.state = initial();
  }
  else {
    init.state = initial;
  }
  init.update = (next: any) => {
    if (typeof next === 'function') {
      init.state = next(init.state);
    }
    else {
      init.state = next;
    }
    init.changed = true;
    polymer.flag();
  };

  polymer.stack[polymer.pc] = init;
  polymer.pc++;
  return [init.state, init.update];
};

export const effect = (p: Polymer.Polymer): UseEffect => (effect: any, deps?: any[]) => {
  const m = p.stack[p.pc];

  if (m) {
    if (m._tag !== EFFECT) {
      throw new HookError('Hooks must be called in the same order');
    }
    p.pc++;
    return;
  }
  const init = Polymer.effect();
  init.update = effect;
  init.deps = deps;
  p.stack[p.pc] = init;
  p.pc++;
  p.queue.push(init.update);
};

export const ref = (p: Polymer.Polymer): UseRef => (initial: any) => {
  const m = p.stack[p.pc];
  if (m) {
    if (m._tag !== REF) {
      throw new HookError('Hooks must be called in the same order');
    }
    p.pc++;
    return m.state;
  }
  const init = Polymer.ref();
  init.state = initial;
  p.stack[p.pc] = init;
  p.pc++;
  return init.state;
};

export const context = (p: Polymer.Polymer) => (context: any) => {
  throw new Error('Unimplemented');
};

export type Use<A = any> = {
  Interaction: () => A;
  Reducer    : UseReducer;
  State      : UseState;
  Effect     : UseEffect;
};

export const make = (p?: Polymer.Polymer): Use => {
  if (!p) {
    throw new HookError('Hooks must be called within a function component');
  }

  return {
    Interaction: interaction(p),
    Reducer    : reducer(p),
    State      : state(p),
    Effect     : effect(p),
  };
};

export const current = MutableRef.make(undefined as undefined | Polymer.Hook);

export const active = {
  polymer: undefined as undefined | Polymer.Polymer,
};
