/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */
import {getHookState} from '#src/disreact/model/hook-state.ts';
import type {E} from '#src/internal/pure/effect.ts';
import console from 'node:console';



export const useState = <A>(initial: A): readonly [state: A, setState: (next: A) => void] => {
  const hooks = getHookState();

  const state = hooks.stack[hooks.pc++];

  if (!state) {
    const newState = {id: hooks.pc, current: initial};

    hooks.stack.push(newState);

    return [initial, (next) => {newState.current = next}] as const;
  }
  return [state.current, (next) => {state.current = next}] as const;
};

type ueffect =
  | (() => void)
  | (() => () => void)
  | (E.Effect<void>)
  | (() => E.Effect<void>);

export const useEffect = (
  effect: ueffect,
  deps: unknown[] = [],
) => {
  const hooks = getHookState();

  const state = hooks.stack[hooks.pc++];

  console.log(state);

  if (!state) {
    console.log(state);

    const newState = {id: hooks.pc, deps};

    hooks.stack.push(newState);
    hooks.queue.push(effect);
  }

  // todo 2d frames of states
};

export const useRef = () => {
  const hooks = getHookState();
  const state = hooks.stack[hooks.pc++];

  if (!state) {
    const newState = {id: `${hooks.id}:${hooks.pc}`, current: null};

    hooks.stack.push(newState);

    return {current: null};
  }

  return {current: state.current};
};
