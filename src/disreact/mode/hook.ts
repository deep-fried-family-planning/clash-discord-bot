/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import type * as El from '#src/disreact/mode/entity/el.ts';
import type {FC} from '#src/disreact/mode/entity/fc.ts';
import * as Polymer from '#src/disreact/mode/entity/polymer.ts';
import * as Rehydrant from '#src/disreact/mode/entity/rehydrant.ts';
import type {Discord} from 'dfx';
import type * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';
import {globalValue} from 'effect/GlobalValue';
import * as Hash from 'effect/Hash';

const __ctx = {
  root   : undefined as undefined | Rehydrant.Rehydrant,
  comp   : undefined as undefined | El.Comp,
  polymer: undefined as undefined | Polymer.Polymer,
};

export const set = (root: Rehydrant.Rehydrant, elem: El.Comp) => {
  __ctx.root = root;
  __ctx.comp = elem;
  __ctx.polymer = Polymer.get(elem);
};

export const reset = () => {
  if (__ctx.polymer) {
    Polymer.commit(__ctx.polymer);
  }
  __ctx.root = undefined;
  __ctx.comp = undefined;
  __ctx.polymer = undefined;
};

const getRoot = () => {
  if (!__ctx.root) {
    throw new Error('Hooks must be called within a component.');
  }
  return __ctx.root;
};

const getComp = () => {
  if (!__ctx.comp) {
    throw new Error('Hooks must be called within a component.');
  }
  return __ctx.comp;
};

const getPolymer = () => {
  if (!__ctx.polymer) {
    throw new Error('Hooks must be called within a component.');
  }
  return __ctx.polymer;
};

export const TypeId = Symbol.for('disreact/Deps/TypeId');

const fns = globalValue(Symbol.for('disreact/deps'), () => new WeakMap<any, El.Comp>());

export declare namespace Deps {
  export interface Fn<P extends any[] = any[], O = any> extends Function {
    (...p: P): O;
    [TypeId]: string;
    [Equal.symbol](that: Equal.Equal): boolean;
    [Hash.symbol](): number;
  }
}
export type Fn<P extends any[] = any[], O = any> = Deps.Fn<P, O>;

export const isFn = (fn: any): fn is Deps.Fn =>
  typeof fn === 'function' &&
  fn[TypeId];

export const fn = <P extends any[], O>(hook: string, link: El.Comp, input: (...p: P) => O): Deps.Fn<P, O> => {
  const fn = input as Deps.Fn<P, O>;
  fn[TypeId] = hook;
  fn[Equal.symbol] = (that: Equal.Equal & Deps.Fn): boolean => {
    if (!isFn(that)) return false;
    return (
      isFn(that)
      && Equal.equals(fn.name, that.name)
      && Equal.equals(fns.get(fn), fns.get(that))
    );
  };
  fn[Hash.symbol] = (): number => Hash.hash(hook);
  fns.set(fn, link);
  return fn;
};

export declare namespace Hook {
  export interface SetState<A> {
    (next: A | ((prev: A) => A)): void;
  }
  export interface Effect extends Function {
    (): void | Promise<void> | E.Effect<void>;
  }
}
export type Effect = Hook.Effect;

export const $useState = <A>(initial: A): readonly [A, Hook.SetState<A>] => {
  const polymer = getPolymer();
  const curr = Polymer.next(
    polymer,
    Polymer.isState,
    () => ({s: initial}),
  );
  const root = getRoot();
  const node = getComp();

  const set: Hook.SetState<A> = fn('useState', __ctx.comp!, (next) => {
    if (typeof next === 'function') {
      curr.s = (next as (prev: A) => A)(curr.s);
    }
    else {
      curr.s = next;
    }
    Rehydrant.addNode(root, node);
  });

  return [curr.s, set];
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

  const fibril = getPolymer();
  const curr = Polymer.next(fibril, Polymer.isDep, () => ({d: deps ?? []}));

  const depEffect = fn('useEffect', __ctx.comp!, effect);

  if (fibril.rc === 0) {
    fibril.queue.push(depEffect);
    return;
  }
  if (!deps) {
    return;
  }
  if (curr.d.length !== deps.length) {
    throw new Error('Hook dependency length mismatch');
  }
  if (curr.d.length === 0 && deps.length === 0) {
    fibril.queue.push(depEffect);
    return;
  }
  for (let i = 0; i < deps.length; i++) {
    if (!Equal.equals(deps[i], curr.d[i])) {
      curr.d = deps;
      fibril.queue.push(depEffect);
      break;
    }
  }
};

export const $useIx = () => {
  const rehydrant = getRoot();
  const node = getPolymer();
  Polymer.next(
    node,
    Polymer.isNull,
    () => null,
  );
  return rehydrant.data as Discord.APIInteraction;
};

export const $usePage = () => {
  const rehydrant = getRoot();
  const node = getPolymer();

  if (!node.stack[node.pc]) {
    node.stack[node.pc] = null;
  }

  if (!Polymer.isNull(node.stack[node.pc])) {
    throw new Error('Hooks must be called in the same order');
  }

  node.pc++;

  return {
    next: (next: FC, props: any = {}) => {
      rehydrant.next.id = next.name;
      rehydrant.next.props = props;
    },

    close: () => {
      rehydrant.next.id = null;
    },
  };
};
