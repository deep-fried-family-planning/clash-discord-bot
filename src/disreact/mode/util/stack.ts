import type * as El from '#src/disreact/mode/entity/el.ts';
import * as MutableList from 'effect/MutableList';

export namespace Stack {
  export type Stack = MutableList.MutableList<El.El>;
}
export type Stack = Stack.Stack;

export const make = (el?: El.El): Stack.Stack => el ? MutableList.make(el) : MutableList.empty();

export const check = (stack: Stack.Stack) => !!MutableList.tail(stack);

export const pop = (stack: Stack.Stack) => MutableList.pop(stack)!;

export const push = (stack: Stack.Stack, next: El.El) => MutableList.append(stack, next);
