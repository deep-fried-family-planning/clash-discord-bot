import type {Hooks} from '#src/disreact/internal/dsx/types.ts';
import {HookDispatch} from '#src/disreact/internal/hooks/HookDispatch.ts';



export const _useIx = () => () => {
  const ctx = HookDispatch.__ctxread();

  return ctx.rest;
};
