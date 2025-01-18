import type {RestEmbed, RestText} from '#pure/dfx';
import {Kv, pipe} from '#pure/effect';
import type {Node} from '#src/internal/disreact/entity/index.ts';
import {type Cd, type Ed, Hook, Unsafe, UnsafeCall, UnsafeHook} from '#src/internal/disreact/entity/index.ts';
import type {opt, str} from '#src/internal/pure/types-pure.ts';


export const makeUseState = <A>(initial: A) => {
  const count = UnsafeHook.getCount();

  const _id = typeof initial === 'number'
              ? `${count}_n`
              : `${count}`;

  const initialHook = Hook.Sync.State({
    id  : _id,
    data: {state: encodeURIComponent(JSON.stringify(initial))},
  });

  const hook = UnsafeHook.getHook<typeof initialHook>(count) ?? UnsafeHook.addHook(initialHook);

  const setState = (next: A) => {
    const update = Hook.Update.SetState({id: _id, next});
    console.log('setState');
    UnsafeCall.addCall(update);
  };

  if (_id.endsWith('_n')) {
    return [parseInt(hook.data.state) as A, setState] as const;
  }
  return [JSON.parse(decodeURIComponent(hook.data.state)) as A, setState] as const;
};


export const makeUseReducer = <
  A extends unknown,
>(
  id: str,
  config: {
    initial: {
      [k in str]: {}
    };
    actions: {
      [k in str]: {}
    };
  },
) => {
  Hook.Sync.UseReducer;
};


export const makeUseRestState = <
  A extends Cd.T['data'] | Ed.T['data'],
>(
  id: str,
  initial?: A,
  restore?: (rest: A) => A,
) => {
  const ref = `rs_${id}`;

  Unsafe.hk_register(Hook.Sync.UseRestState({
    id     : ref,
    restore: restore ?? ((rest) => ({...rest})),
    initial,
  }));

  const updater = (next: opt<A>) => {
    Unsafe.hk_update(Hook.Update.SetRestState({id: ref, next}));
  };

  return [ref, updater] as const;
};


export const makeUseDialogRestState = (
  id: str,
  open: (embed: opt<RestEmbed>) => opt<RestText>,
  submit: (text: opt<RestText>) => opt<RestEmbed>,
  restore?: (rest: opt<RestEmbed>) => opt<RestEmbed>,
) => {
  const ref = `drs_${id}`;

  Unsafe.hk_register(Hook.Sync.UseDialogRestState({
    id     : ref,
    open,
    submit,
    restore: restore ?? ((rest) => ({...rest})),
  }));

  const updater = (next: opt<RestEmbed>) => {
    Unsafe.hk_update(Hook.Update.SetRestState({id: ref, next}));
  };

  return [ref, updater] as const;
};


export const makeUseRoute = <A extends { [k in str]: Node.DisReactNodeFn }>(nodes: A) => {
  UnsafeHook.setNodes(nodes);

  const updater = (next: str) => {
    UnsafeCall.setNextNode(next);
  };

  return [
    pipe(nodes, Kv.mapEntries((_, k) => [k, k] as const)) as { [k in keyof A]: k },
    updater,
  ] as const;
};
