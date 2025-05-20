import type * as Elem from '#src/disreact/mode/entity/elem.ts';
import * as Deps from '#src/disreact/mode/state/deps.ts';
import * as Fibril from '#src/disreact/mode/state/fibril.ts';
import type * as Rehydrant from '#src/disreact/mode/state/rehydrant.ts';
import type {Discord} from 'dfx';
import type * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';

const context = {
  rehydrant: undefined as undefined | Rehydrant.Rehydrant,
  elem     : undefined as undefined | Elem.Fn,
  fibril   : undefined as undefined | Fibril.Fibril,
};

export const setContext = (rehydrant: Rehydrant.Rehydrant, elem: Elem.Fn, fibril: Fibril.Fibril) => {
  context.rehydrant = rehydrant;
  context.elem = elem;
  context.fibril = fibril;
};

export const resetContext = () => {
  context.rehydrant = undefined;
  context.elem = undefined;
  context.fibril = undefined;
};

const getFibril = () => {
  if (!context.fibril) {
    throw new Error('Hooks must be called within a component.');
  }
  return context.fibril;
};

export declare namespace Hook {
  export interface SetState<A> {
    (next: A | ((prev: A) => A)): void;
  }
  export interface Effect {
    (): void | Promise<void> | E.Effect<void>;
  }
}

export const $useState = <A>(initial: A): readonly [A, Hook.SetState<A>] => {
  const fibril = getFibril();
  const curr = Fibril.next(
    fibril,
    Fibril.isState,
    () => ({s: initial}),
  );

  const set: Hook.SetState<A> = Deps.fn('useState', context.elem!, (next) => {
    if (typeof next === 'function') {
      curr.s = (next as (prev: A) => A)(curr.s);
    }
    else {
      curr.s = next;
    }
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

  const fibril = getFibril();
  const curr = Fibril.next(
    fibril,
    Fibril.isDependency,
    () => ({d: deps ?? []}),
  );

  const depEffect = Deps.fn('useEffect', context.elem!, effect);

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
  const node = getFibril();
  Fibril.next(
    node,
    Fibril.isNull,
    () => null,
  );
  return node.rehydrant.data as Discord.APIInteraction;
};

export const $usePage = () => {
  const node = getFibril();

  if (!node.stack[node.pc]) {
    node.stack[node.pc] = null;
  }

  if (!Fibril.isNull(node.stack[node.pc])) {
    throw new Error('Hooks must be called in the same order');
  }

  node.pc++;

  return {
    next: (next: FC, props: any = {}) => {
      node.rehydrant.next.id = next.name;
      node.rehydrant.next.props = props;
    },

    close: () => {
      node.rehydrant.next.id = null;
    },
  };
};
