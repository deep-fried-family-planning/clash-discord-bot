import {CLOSE} from '#src/disreact/abstract/index.ts';
import {HookDispatch} from '#src/disreact/internal/hooks/HookDispatch.ts';
import type {RenderFn} from '#src/disreact/internal/index.ts';



export const _useIx = () => () => {
  const ctx = HookDispatch.__ctxread();

  return ctx.rest;
};



export const _usePage = () => (_: RenderFn[]) => {
  const ctx = HookDispatch.__ctxread();

  return {
    next: (next: RenderFn) => {
      ctx.next = next.name;
    },
    close: () => {
      ctx.next = CLOSE;
    },
  };
};
