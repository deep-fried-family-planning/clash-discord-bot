import type {Hook, Node} from '#src/internal/disreact/entity/index.ts';
import type {rec} from '#src/internal/pure/types-pure.ts';


let call_num = 0;

export const call_id = () => call_num++;
export const call_reset = () => call_num = 0;
export const call_get = () => call_num;


let root_count = 0,
    node_count = 0,
    hook_count = 0;


let node_count_unique = 0;

export const unique_node_count  = () => node_count_unique++;
export const getNodeCountUnique = () => node_count_unique;


export const root_count_increment = () => root_count++;
export const resRootCount         = () => root_count = 0;
export const root_count_get       = () => root_count;
export const node_count_increment = () => node_count++;
export const resNodeCount         = () => node_count = 0;
export const getNodeCount         = () => hook_count;
export const incHookCount         = () => hook_count++;
export const hook_count_reset     = () => hook_count = 0;
export const getHookCount         = () => hook_count;


let hook_count_for_node  = 0;

export const node_hook_count = () => hook_count_for_node++;
export const node_hook_reset = () => hook_count_for_node = 0;


let nodes = {} as rec<Node.Fn>;

export const nodes_set     = (n: rec<Node.Fn>) => nodes = n;
export const nodes_collect = () => ({...nodes});
export const nodes_reset   = () => nodes = {};


let next_node = '';

export const set_next_node = (n: string) => next_node = n;
export const get_next_node = () => {
  const temp = next_node;
  next_node = '';
  return temp;
};


let internal_hk_registry = {} as rec<Hook.SyncCall>;
let hook_calls           = [] as Hook.UpdateCall[];

export const hk_registry   = () => ({...internal_hk_registry});
export const hk_calls      = () => [...hook_calls];
export const hk_flush      = () => hook_calls = [];
export const hk_unregister = () => internal_hk_registry = {};

export const hk_update = (hk: Hook.UpdateCall) => {
  hook_calls.push(hk);
};

export const hk_register = <A extends Hook.SyncCall>(hk: A): A => {
  internal_hk_registry[hk.id] = hk;
  return hk;
};

export const hk_getState = <A extends Hook.SyncCall>(hk: A) => internal_hk_registry[hk.id];

export const hk_setState = <A extends Hook.SyncCall>(hk: A) => internal_hk_registry[hk.id] = hk;
