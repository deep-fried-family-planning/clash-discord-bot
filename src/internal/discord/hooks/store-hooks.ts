import type {DialogName, HookId, ViewModifier, ViewName} from '#discord/hooks/context.ts';
import type {Accessor} from '#discord/hooks/use-accessor.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export type Hooks = {
  states   : HookId[];
  effects  : [HookId, () => void][];
  slices   : str[];
  actions  : str[];
  views    : [ViewName, DialogName, ViewModifier];
  accessors: Accessor[];
};


export const makeEmptyHooks = (): Hooks => ({
  states   : [],
  effects  : [],
  slices   : [],
  actions  : [],
  views    : ['', '', ''],
  accessors: [],
});


let hooks: Hooks = makeEmptyHooks();


export const getHooks        = () => hooks;
export const setHooks        = (next: Hooks) => {hooks = next};
export const clearHooks      = () => {hooks = makeEmptyHooks()};
export const addStateHookId  = (id: str) => hooks.states.push(id);
export const addAccessorHook = (accessor: Accessor) => hooks.accessors.push(accessor);
export const getFirstView    = () => hooks.views[0];
export const setFirstView    = (id: str) => {
  hooks.views[0] = id;
  console.log('first view:', hooks.views[0]);
};
export const getNextView     = () => hooks.views[1];
export const setNextView     = (id: str) => {
  hooks.views[1] = id;
  console.log('first view:', hooks.views[1]);
};
export const getViewModifier = () => hooks.views[2];
export const setViewModifier = (id: str) => {hooks.views[2] = id};


export {hooks};
