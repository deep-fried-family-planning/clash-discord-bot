import {Deps} from '#disreact/codec/a/codec/old/deps.ts';
import type {Discord} from 'dfx';
import type * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';

export const active = {
  polymer: undefined as undefined |  Polymer.Polymer,
};

const assert = () => {
  if (!active.polymer) {
    throw new Error('Disreact hooks can only be called within a component.');
  }
  return active.polymer;
};

const UseStateMonomerPrototype = proto.type({
  _tag : MONOMER_STATE,
  state: undefined,
  dispatch(next: any) {
    if (typeof next === 'function') {
      this.state = next(this.state);
    }
    else {
      this.state = next;
    }
    Lineage;
  },
});

export const ustate = (initial: any) =>
  assert().pipe(

  );

export const $useState = (initial: any) => {
  const polymer = getPolymer();
  const monomer = Polymer.next(polymer, Polymer.isState, () => Polymer.state(initial));
  const root = getRoot();
  const node = getComp();

  const mono = proto.init(UseStateMonomerPrototype, {
    state: initial,
  });

  const set = Deps.fn('useState', node, (next) => {
    if (typeof next === 'function') {
      monomer.s = next(monomer.s);
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

export const $useInteraction = () => {
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
  const next = Deps.fn('usePage', node, (next: FC.FC, props: any = {}) => {
    root.next.id = next.name;
    root.next.props = props;
  });
  const close = Deps.fn('usePage', node, () => {
    root.next.id = null;
  });
  return Deps.item('usePage', node, {next, close});
};
