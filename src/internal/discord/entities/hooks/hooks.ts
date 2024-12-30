import type {DialogName, HookId, ViewModifier, ViewName} from '#discord/context/context.ts';
import type {Accessor} from '#discord/entities/hooks/use-dialog-ref.ts';
import type {UseEffectHook} from '#discord/entities/hooks/use-effect.ts';
import type {UseRestEmbedRef} from '#discord/entities/hooks/use-rest-embed-ref.ts';
import type {RxRef} from '#discord/entities/hooks/use-rest-ref.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import console from 'node:console';


export type Hooks = {
  states   : HookId[];
  effects  : UseEffectHook[];
  refs     : RxRef[];
  embeds   : UseRestEmbedRef[];
  slices   : str[];
  actions  : str[];
  views    : [ViewName, DialogName, ViewModifier];
  accessors: Accessor[];
};


export const makeEmptyHooks = (): Hooks => ({
  states   : [],
  effects  : [],
  refs     : [],
  embeds   : [],
  slices   : [],
  actions  : [],
  views    : ['', '', ''],
  accessors: [],
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
