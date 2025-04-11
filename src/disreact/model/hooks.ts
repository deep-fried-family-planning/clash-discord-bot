import type {FC} from '#src/disreact/model/entity/fc.ts';
import {Fibril} from '#src/disreact/model/entity/fibril.ts';
import type {E} from '#src/internal/pure/effect.ts';

export * as Hooks from './hooks.ts';
export type Hooks = never;

interface SetState<A> {
  (next: A): void;
  (updater: (prev: A) => A): void;
}

interface EffectFn {
  (): void | Promise<void> | E.Effect<void>;
}

//
//
//
export const $useState = <A>(initial: A): readonly [A, SetState<A>] => {
  const node = Fibril.λ.get();

  node.stack[node.pc] ??= {s: initial};

  const curr = node.stack[node.pc];

  if (!Fibril.isState(curr)) {
    throw new Error('Hooks must be called in the same order');
  }

  const set: SetState<A> = (next) => {
    if (typeof next === 'function') {
      curr.s = (next as (prev: A) => A)(curr.s);
    }
    else {
      curr.s = next;
    }
  };

  node.pc++;

  return [curr.s, set];
};

//
//
//
export const $useReducer = <A, B>(reducer: (prev: A, action: B) => A, initialState: A): readonly [A, (action: B) => void] => {
  return [] as any;
};

//
//
//
export const $useEffect = (effect: EffectFn, deps?: any[]): void => {
  if (deps) {
    for (const dep of deps) {
      switch (typeof dep) {
        case 'symbol':
        case 'function':
          throw new Error(`Unsupported hook dependency type: ${dep.toString()}`);
      }
    }
  }

  const node = Fibril.λ.get();

  if (!node.stack[node.pc]) {
    node.stack[node.pc] = {d: deps ?? []};
  }

  const curr = node.stack[node.pc];

  if (!Fibril.isDependency(curr)) {
    throw new Error('Hooks must be called in the same order');
  }

  node.pc++;

  if (node.rc === 0) {
    node.queue.push(effect);
    return;
  }

  if (!deps) {
    return;
  }

  if (curr.d.length !== deps.length) {
    throw new Error('Hook dependency length mismatch');
  }

  if (curr.d.length === 0 && deps.length === 0) {
    node.queue.push(effect);
    return;
  }

  for (let i = 0; i < deps.length; i++) {
    if (deps[i] !== curr.d[i]) {
      curr.d = deps;
      node.queue.push(effect);
      break;
    }
  }
};

//
//
//
export const $useIx = () => {
  const node = Fibril.λ.get();

  if (!node.stack[node.pc]) {
    node.stack[node.pc] = null;
  }

  if (!Fibril.isNull(node.stack[node.pc])) {
    throw new Error('Hooks must be called in the same order');
  }

  node.pc++;

  return node.nexus?.request;
};

//
//
//
export const $usePage = (_: FC[]) => {
  const node = Fibril.λ.get();

  if (!node.stack[node.pc]) {
    node.stack[node.pc] = null;
  }

  if (!Fibril.isNull(node.stack[node.pc])) {
    throw new Error('Hooks must be called in the same order');
  }

  node.pc++;

  return {
    next: (next: FC, props: any = {}) => {
      node.nexus!.next.id = next.name;
      node.nexus!.next.props = props;
    },

    close: () => {
      node.nexus!.next.id = null;
    },
  };
};
