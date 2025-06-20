/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import type * as Element from '#src/disreact/model/domain/element.ts';
import type {FC} from '#src/disreact/codec/fc.ts';
import * as Polymer from '#src/disreact/model/domain/polymer.ts';
import * as Globals from '#src/disreact/model/infrastructure/current.ts';
import * as Rehydrant from '#src/disreact/model/domain/envelope.ts';
import * as Deps from '#src/disreact/codec/old/deps.ts';
import type {Discord} from 'dfx';
import * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';
import {pipe} from 'effect/Function';
import * as P from 'effect/Predicate';

const getRoot = () => {
  const ctx = Globals.get().root;
  if (!ctx) {
    throw new Error('Hooks must be called within a component.');
  }
  return ctx;
};

const getComp = () => {
  const ctx = Globals.get().node;
  if (!ctx) {
    throw new Error('Hooks must be called within a component.');
  }
  return ctx;
};

const getPolymer = () => {
  const ctx = Globals.get().poly;
  if (!ctx) {
    throw new Error('Hooks must be called within a component.');
  }
  return ctx;
};

export namespace Hook {
  export interface SetState<S> extends Function {
    (next: S | ((prev: S) => S)): void;
  }
  export interface Effect extends Function {
    (): void | Promise<void> | E.Effect<void, any, any>;
  }
}
export interface SetState<S> extends Function {
  (next: S | ((prev: S) => S)): void;
}
export interface Effect extends Function {
  (): void | Promise<void> | E.Effect<void>;
}

export const $useState = <S>(initial: S): readonly [S, Hook.SetState<S>] => {
  const polymer = getPolymer();
  const monomer = Polymer.next(polymer, Polymer.isState, () => Polymer.state(initial));
  const root = getRoot();
  const node = getComp();

  const set: Hook.SetState<S> = Deps.fn('useState', node, (next) => {
    if (typeof next === 'function') {
      monomer.s = (next as (prev: S) => S)(monomer.s);
    }
    else {
      monomer.s = next;
    }
    Rehydrant.enqueueRender(root, node);
  });

  return [monomer.s, set];
};

export const $useReducer = <A, S>(reducer: (state: S, action: A) => S | Promise<S> | E.Effect<S, any, any>, initial: S) => {
  const polymer = getPolymer();
  const monomer = Polymer.next(polymer, Polymer.isState, () => Polymer.state(initial));
  const root = getRoot();
  const node = getComp();

  const dispatch = Deps.fn('useReducer', node, (action: A) => {
    Rehydrant.enqueueRender(root, node);
    polymer.queue.push(() => {
      if (reducer.constructor.name === 'AsyncFunction') {
        return pipe(
          E.promise(async () => await reducer(monomer.s, action)) as E.Effect<S>,
          E.tap((output) => {
            monomer.s = output;
          }),
          E.asVoid,
        );
      }
      const state = reducer(monomer.s, action);
      if (P.isPromise(state)) {
        return pipe(
          E.promise(async () => await state) as E.Effect<S>,
          E.tap((output) => {
            monomer.s = output;
          }),
          E.asVoid,
        );
      }
      if (E.isEffect(state)) {
        return pipe(
          state as E.Effect<S>,
          E.tap((output) => {
            monomer.s = output;
          }),
          E.asVoid,
        );
      }
      monomer.s = state;
      return E.void;
    });
  });

  return [monomer.s, dispatch] as readonly [S, (action: A) => void];
};

export const $useEffect = (effect: Hook.Effect, deps?: any[]): void => {
  if (deps) {
    for (const dep of deps) {
      switch (typeof dep) {
        case 'symbol':
        case 'function':
          throw new Error(`Unsupported hook dependency type: ${dep.toString()}`);
      }
    }
  }
  const polymer = getPolymer();
  const monomer = Polymer.next(polymer, Polymer.isDeps, () => Polymer.deps(deps));
  const root = getRoot();
  const node = getComp();
  const fn = Deps.fn('useEffect', node, effect);

  if (polymer.rc === 0) {
    polymer.queue.push(fn as any);
    return;
  }
  if (!deps) {
    return;
  }
  if (monomer.d.length !== deps.length) {
    throw new Error('Hook dependency length mismatch');
  }
  if (monomer.d.length === 0 && deps.length === 0) {
    polymer.queue.push(fn as any);
    return;
  }
  for (let i = 0; i < deps.length; i++) {
    if (!Equal.equals(deps[i], monomer.d[i])) {
      monomer.d = deps;
      polymer.queue.push(fn as any);
      break;
    }
  }
};

export const $useIx = () => {
  const polymer = getPolymer();
  // const monomer = Polymer.next(polymer, Polymer.isNone, () => Polymer.none());
  const root = getRoot();
  const node = getComp();
  const data = root.data as Discord.APIInteraction;
  return Deps.item('useIx', node, structuredClone(data));
};

export const $usePage = () => {
  const polymer = getPolymer();
  // const monomer = Polymer.next(polymer, Polymer.isNone, () => Polymer.none());
  const root = getRoot();
  const node = getComp();
  const next = Deps.fn('usePage', node, (next: FC, props: any = {}) => {
    root.next.id = next.name;
    root.next.props = props;
  });
  const close = Deps.fn('usePage', node, () => {
    root.next.id = null;
  });
  return Deps.item('usePage', node, {next, close});
};
