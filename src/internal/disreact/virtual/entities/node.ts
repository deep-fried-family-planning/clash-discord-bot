import {type Co, Df, type Hk, Un} from '#src/internal/disreact/virtual/entities/index.ts';
import type {num, rec, str} from '#src/internal/pure/types-pure.ts';


export type T<A extends Co.T = Co.T> = {
  _tag          : A['_tag'];
  root_name     : str;
  root_id       : num;
  node_name     : str;
  node_id       : num;
  hooks         : () => Hk.Sync[];
  mount         : () => A;
  childrenById  : rec<T>;
  childrenByName: rec<T>;
  onMountDefer  : Df.T;
  restAuths?    : boolean;
  customAuths?  : boolean;
};

export type Node<A extends Co.T = Co.T> = T<A>;

export type Fn<A extends Co.T = Co.T> = () => A;

export type KeyedFns = rec<Fn>;


export const createRoot = (root_name: str, fn: Fn): T => {
  Un.resetNodes();
  Un.resetHooks();
  Un.resetHookCalls();

  const call_id = Un.call_id();
  const root    = createNode(root_name, call_id, root_name, fn);
  const nodes   = Un.getNodes();

  for (const [node_name, node_fn] of Object.entries(nodes)) {
    createRootInner(root, node_name, node_fn);
  }

  return root;
};


const createRootInner = (
  root: Node,
  node_name: str,
  fn: Fn,
) => {
  if (node_name in root.childrenByName) return;

  Un.resetNodes();
  const node                      = createNode(root.root_name, root.root_id, node_name, fn);
  root.childrenByName[node_name]  = node;
  root.childrenById[node.node_id] = node;
  const nodes                     = Un.getNodes();

  for (const [name, node_fn] of Object.entries(nodes)) {
    createRootInner(root, name, node_fn);
  }
};


const createNode = (root_name: str, root_id: num, node_name: str, fn: Fn): T => {
  Un.resetHooks();

  const output  = fn();
  const call_id = Un.call_id();
  const hooks   = Un.getHooks();

  return {
    _tag          : output._tag,
    root_name,
    root_id,
    node_name,
    node_id       : call_id,
    hooks         : () => [...hooks],
    mount         : fn,
    childrenByName: {},
    childrenById  : {},
    onMountDefer  : output.defer ?? Df.None,
  };
};
