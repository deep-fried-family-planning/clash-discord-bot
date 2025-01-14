import type { Tx} from '#src/internal/disreact/entity/index.ts';
import type {Hook, VDialog, VMessage} from '#src/internal/disreact/entity/index.ts';
import {Auth, Unsafe, UnsafeCall, UnsafeHook} from '#src/internal/disreact/entity/index.ts';
import type {num, rec, str} from '#src/internal/pure/types-pure.ts';


export type FnOutput = VMessage.T | VDialog.T;
export type DisReactNode<A extends FnOutput = FnOutput> = {
  _tag     : A['_tag'];
  needsAuth: boolean;
  call_id  : num;
  root_id  : str;
  node_id  : str;
  mount    : () => Hook.SyncCall[];
  render   : () => A;
  children : rec<Node>;
  defer    : Tx.Defer;
};
export type DisReactNodeFn<A = FnOutput> = () => A;
export type Node = DisReactNode;
export type Fn = DisReactNodeFn;


export const createNode = (
  root_id: str,
  fn: Fn,
  id?: str,
): Node => {
  const call_id = Unsafe.call_id();
  const output = fn();

  UnsafeCall.flushCalls();
  const hooks = UnsafeHook.flushHooks();

  return {
    _tag     : output._tag,
    needsAuth: !!output.components.find((row) => row.find((component) => Auth.requiresCustomAuth(component.auths))),
    call_id  : call_id,
    root_id  : root_id,
    node_id  : id ?? `n-${call_id}`,
    mount    : () => [...hooks],
    render   : fn,
    children : {},
    defer    : output.defer,
  };
};
