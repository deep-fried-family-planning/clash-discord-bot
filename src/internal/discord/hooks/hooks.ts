import type {DialogName, HookId, ViewModifier, ViewName} from '#discord/context/context.ts';
import type {UseComponentReducerAction, UseComponentReducerStore} from '#discord/hooks/use-component-reducer.ts';
import type {RxRef} from '#discord/hooks/use-component-ref.ts';
import type {Accessor} from '#discord/hooks/use-dialog-ref.ts';
import type {UseEmbedRef} from '#discord/hooks/use-embed-ref.ts';
import type {UseEffectHook} from '#discord/hooks/use-view-effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import console from 'node:console';


export type Hooks = {
  states   : HookId[];
  effects  : UseEffectHook[];
  refs     : RxRef[];
  embeds   : UseEmbedRef[];
  slices   : str[];
  views    : [ViewName, DialogName, ViewModifier];
  accessors: Accessor[];
  reducers : UseComponentReducerStore[];
  actions  : UseComponentReducerAction[];
};


export const makeEmptyHooks = (): Hooks => ({
  states   : [],
  effects  : [],
  refs     : [],
  embeds   : [],
  slices   : [],
  views    : ['', '', ''],
  accessors: [],
  reducers : [],
  actions  : [],
});


let hooks: Hooks = makeEmptyHooks();


export const getHooks   = () => hooks;
export const setHooks   = (next: Hooks) => {hooks = next};
export const clearHooks = () => {hooks = makeEmptyHooks()};


export const addStateHookId  = (id: str) => hooks.states.push(id);
export const addAccessorHook = (accessor: Accessor) => hooks.accessors.push(accessor);
export const addEffectHook   = (effect: UseEffectHook) => hooks.effects.push(effect);


export const getFirstView = () => hooks.views[0];
export const setFirstView = (id: str) => {
  hooks.views[0] = id;
};


export const getNextView = () => hooks.views[1];
export const setNextView = (id: str) => {
  console.log('next view', id);
  hooks.views[1] = id;
};


export const getViewModifier = () => hooks.views[2];
export const setViewModifier = (id: str) => {
  hooks.views[2] = id;
};


export {hooks};
