/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import type * as El from '#src/disreact/model/entity/el.ts';
import type {FC} from '#src/disreact/model/entity/fc.ts';
import * as Monomer from '#src/disreact/model/entity/monomer.ts';
import * as Polymer from '#src/disreact/model/entity/polymer.ts';
import * as Rehydrant from '#src/disreact/model/entity/rehydrant.ts';
import type {Discord} from 'dfx';
import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';
import {pipe} from 'effect/Function';
import * as GlobalValue from 'effect/GlobalValue';
import * as Hash from 'effect/Hash';
import * as P from 'effect/Predicate';

const __ctx = {
  root   : undefined as undefined | Rehydrant.Rehydrant,
  comp   : undefined as undefined | El.Comp,
  polymer: undefined as undefined | Polymer.Polymer,
};

export const set = (root: Rehydrant.Rehydrant, elem: El.Comp) => E.sync(() => {
  __ctx.root = root;
  __ctx.comp = elem;
  __ctx.polymer = Polymer.get(elem);
});

export const reset = E.sync(() => {
  if (__ctx.polymer) {
    Polymer.commit(__ctx.polymer);
  }
  __ctx.root = undefined;
  __ctx.comp = undefined;
  __ctx.polymer = undefined;
});

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

export const DepTypeId = Symbol.for('disreact/dep');
export const DepLinkId = Symbol.for('disreact/dep/link');

export type DepObj<A> = A & {
  [DepTypeId]: string;
  [DepLinkId]: {
    [Equal.symbol](that: Equal.Equal): boolean;
    [Hash.symbol](): number;
  };
  [Equal.symbol](that: Equal.Equal): boolean;
  [Hash.symbol](): number;
};

export interface DepFn extends Function {
  (...p: any): any;
  [DepTypeId]: string;
  [Equal.symbol](that: Equal.Equal): boolean;
  [Hash.symbol](): number;
}

export const isDepObj = (obj: any): obj is DepObj<any> => obj && typeof obj === 'object' && obj[DepTypeId];

export const isDepFn = (fn: any): fn is DepFn => typeof fn === 'function' && fn[DepTypeId];

const links = GlobalValue.globalValue(
  Symbol.for('disreact/dep/links'),
  () => new WeakMap<any, El.Comp>(),
);

const depObj = <A>(hook: string, comp: El.Comp, obj: A): A => {
  const dep = obj as unknown as DepObj<A>;
  dep[DepTypeId] = hook;
  dep[DepLinkId] = {
    [Equal.symbol]: (that: Equal.Equal): boolean => {
      const thisLink = links.get(this);
      const thatLink = links.get(that);
      return Equal.equals(thisLink, thatLink);
    },
    [Hash.symbol]: (): number => Hash.hash(hook),
  };
  links.set(dep[DepLinkId], comp);
  return Data.struct(dep);
};

const depFn = <F extends (...p: any) => any>(hook: string, comp: El.Comp, func: F): F => {
  const fn = func as unknown as DepFn;
  fn[DepTypeId] = hook;
  fn[Equal.symbol] = (that: Equal.Equal & DepFn): boolean => {
    if (!isDepFn(that)) return false;
    return (
      isDepFn(that)
      && Equal.equals(fn.name, that.name)
      && Equal.equals(links.get(fn), links.get(that))
    );
  };
  fn[Hash.symbol] = (): number => Hash.hash(hook);
  links.set(fn, comp);
  return fn as unknown as F;
};

export declare namespace Hook {
  export interface SetState<S> extends Function {
    (next: S | ((prev: S) => S)): void;
  }
  export interface Effect extends Function {
    (): void | Promise<void> | E.Effect<void>;
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
  const monomer = Polymer.next(polymer, Monomer.isState, () => Monomer.state(initial));
  const root = getRoot();
  const node = getComp();

  const set: Hook.SetState<S> = depFn('useState', node, (next) => {
    if (typeof next === 'function') {
      monomer.s = (next as (prev: S) => S)(monomer.s);
    }
    else {
      monomer.s = next;
    }
    Rehydrant.addNode(root, node);
  });

  return [monomer.s, set];
};

export const $useReducer = <A, S>(reducer: (state: S, action: A) => S | Promise<S> | E.Effect<S, any, any>, initial: S) => {
  const polymer = getPolymer();
  const monomer = Polymer.next(polymer, Monomer.isState, () => Monomer.state(initial));
  const root = getRoot();
  const node = getComp();

  const dispatch = depFn('useReducer', node, (action: A) => {
    Rehydrant.addNode(root, node);
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
  const monomer = Polymer.next(polymer, Monomer.isDep, () => Monomer.dep(deps));
  const root = getRoot();
  const node = getComp();
  const fn = depFn('useEffect', node, effect);

  if (polymer.rc === 0) {
    polymer.queue.push(fn);
    return;
  }
  if (!deps) {
    return;
  }
  if (monomer.d.length !== deps.length) {
    throw new Error('Hook dependency length mismatch');
  }
  if (monomer.d.length === 0 && deps.length === 0) {
    polymer.queue.push(fn);
    return;
  }
  for (let i = 0; i < deps.length; i++) {
    if (!Equal.equals(deps[i], monomer.d[i])) {
      monomer.d = deps;
      polymer.queue.push(fn);
      break;
    }
  }
};

export const $useIx = () => {
  const polymer = getPolymer();
  const monomer = Polymer.next(polymer, Monomer.isNull, () => Monomer.null());
  const root = getRoot();
  const node = getComp();
  return root.data as Discord.APIInteraction;
};

export const $usePage = () => {
  const polymer = getPolymer();
  const monomer = Polymer.next(polymer, Monomer.isNull, () => Monomer.null());
  const root = getRoot();
  const node = getComp();
  const next = depFn('usePage', node, (next: FC, props: any = {}) => {
    root.next.id = next.name;
    root.next.props = props;
  });
  const close = depFn('usePage', node, () => {
    root.next.id = null;
  });
  return depObj('usePage', node, {next, close} as const);
};
