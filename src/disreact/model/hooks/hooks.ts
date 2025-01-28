/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */



import {getHookState} from '#src/disreact/model/hooks/hook-state.ts';



export const useState = <A>(initial: A): readonly [state: A, setState: (next: A) => void] => {
  const hooks = getHookState();

  const state = hooks.stack[hooks.pc++];

  if (!state) {
    const newState = {id: hooks.pc, current: initial};

    hooks.stack.push(newState);

    return [
      initial,
      (next) => {
        newState.current = next;
      },
    ] as const;
  }

  return [
    state.current,
    (next) => {
      state.current = next;
    },
  ] as const;
};
