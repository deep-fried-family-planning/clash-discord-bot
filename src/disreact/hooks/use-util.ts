import {CLOSE} from '#src/disreact/codec/abstract/index.ts';
import type {RenderFn} from '#src/disreact/dsx/lifecycle.ts';
import {HookDispatch} from '#src/disreact/hooks/HookDispatch.ts';



export const _useIx = () => () => {
  const ctx = HookDispatch.__ctxread();

  return (ctx as any).rest;
};



export const _usePage = () => (_: RenderFn[]) => {
  const ctx = HookDispatch.__ctxread();

  return {
    next: (next: RenderFn, props: any = {}) => {
      ctx.next = next.name;
      ctx.nextProps = props;
    },
    close: () => {
      ctx.next = CLOSE;
    },
  };
};
