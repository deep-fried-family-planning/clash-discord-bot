/* eslint-disable @typescript-eslint/no-explicit-any */
import {NONE_STR} from '#src/disreact/abstract/index.ts';
import {E, L} from '#src/internal/pure/effect.ts';
import {GlobalValue} from 'effect';



export type MainHookState = {
  next: string;
};

export type NodeHookState = {
  pc   : number;
  stack: any[];
  queue: any[];
  rc   : number;
};

const syncMains = GlobalValue.globalValue(Symbol.for('DisReact.HookState.syncMains'), () => new WeakMap<
  symbol,
  MainHookState
>());

const syncStates = GlobalValue.globalValue(Symbol.for('DisReact.HookState.syncStates'), () => new WeakMap<
  symbol,
  Map<string, NodeHookState>
>());

const make = (id: symbol) => E.sync(() => {
  HookState.__malloc(id);

  return {

  };
});

export class HookState extends E.Tag('DisReact.HookState')<
  HookState,
  E.Effect.Success<ReturnType<typeof make>>
>() {
  static makeLayer = (id: symbol) => L.effect(this, make(id));

  static emptyMain = (): MainHookState => ({
    next: NONE_STR,
  });

  static emptyNode = (): NodeHookState => ({
    pc   : 0,
    stack: [],
    queue: [],
    rc   : 0,
  });

  static __malloc = (id: symbol) => {
    syncMains.set(id, HookState.emptyMain());
    syncStates.set(id, new Map());
  };

  static __free = (id: symbol) => {
    syncMains.delete(id);
    syncStates.delete(id);
  };

  static __readmain = (id: symbol) => syncMains.get(id);

  static __readnode = (id: symbol, name: string) => syncStates.get(id)?.get(name);
}
