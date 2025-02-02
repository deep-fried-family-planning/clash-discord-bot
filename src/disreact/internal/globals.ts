/* eslint-disable @typescript-eslint/no-explicit-any */
import type {attachHooks, FiberState} from '#src/disreact/internal/hooks.ts';
import {Fiber, GlobalValue as GV, Option, pipe} from 'effect';



export type InteractionSymbol = symbol;
export const makeInteractionSymbol = (id: string): InteractionSymbol => Symbol(id);



export const _state = GV.globalValue(Symbol.for('DisReact.state'), () => new WeakMap<
  InteractionSymbol,
  unknown
>());


export const _hooks = GV.globalValue(Symbol.for('DisReact.hooks'), () => new WeakMap<
  Fiber.RuntimeFiber<any, any>,
  FiberState
>());



export const _currentFiber = pipe(Fiber.getCurrentFiber(), Option.match({
  onNone: () => null,
  onSome: (fiber) => fiber,
}));



export const _activeFiber = () => {
  const fiber = Fiber.getCurrentFiber();
  if (Option.isNone(fiber))
    throw new Error('Hooks cannot be called from outside the render function.');
  return fiber.value;
};



export const DisReactDispatcher = {
  current: null as null | ReturnType<typeof attachHooks>,
};



export const getDispatcher = () => {
  if (DisReactDispatcher.current === null)
    throw new Error('Hooks cannot be called from outside the render function.');
  return DisReactDispatcher.current;
};
