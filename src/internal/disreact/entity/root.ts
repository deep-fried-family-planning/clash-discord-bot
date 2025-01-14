import {Kv} from '#pure/effect';
import type {Hook, Tx} from '#src/internal/disreact/entity/index.ts';
import {Node, UnsafeCall, UnsafeHook} from '#src/internal/disreact/entity/index.ts';
import type {num, rec, str} from '#src/internal/pure/types-pure.ts';
import console from 'node:console';


export type DisReactRoot<A extends Node.FnOutput = Node.FnOutput> = {
  _tag     : A['_tag'];
  needsAuth: boolean;
  call_id  : num;
  root_id  : str;
  node_id  : str;
  mount    : () => Hook.SyncCall[];
  render   : () => A;
  children : rec<Node.Node>;
  defer    : Tx.Defer;
};


export type Root = DisReactRoot;
export type KeyNamedRoots = rec<Node.DisReactNodeFn>;


export const isRoot = (root: Root | Node.Node): root is Root => root.root_id === root.node_id;


export const createRoot = (fn: Node.Fn, name: str): Root => {
  const root_id = name;
  const root    = Node.createNode(root_id, fn, root_id);

  return root;
};


export const recurseFromRoot = (root: Root) => {
  UnsafeCall.flushCalls();
  UnsafeHook.flushHooks();

  root.render();
  const nodeFns = UnsafeHook.flushNodes();

  for (const [id, fn] of Kv.toEntries(nodeFns)) {
    recurseFromRootInner(root, id, fn);
  }

  return root;
};


const recurseFromRootInner = (
  root: Root,
  node_id: str,
  node_fn: Node.Fn,
) => {
  if (node_id === root.root_id) return;
  if (node_id in root.children) return;
  UnsafeCall.flushCalls();
  UnsafeHook.flushHooks();

  root.children[node_id] = Node.createNode(root.root_id, node_fn, node_id);

  console.log(root.children[node_id].mount());

  node_fn();
  const nodeFns = UnsafeHook.flushNodes();

  for (const [id, fn] of Kv.toEntries(nodeFns)) {
    if (id === root.root_id) continue;
    if (id in root.children) continue;
    recurseFromRootInner(root, id, fn);
  }
};
