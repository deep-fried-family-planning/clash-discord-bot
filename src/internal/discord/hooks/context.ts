import {createUseDispatch} from '#discord/hooks/use-dispatch.ts';
import {createUseEffect} from '#discord/hooks/use-effect.ts';
import {createUseSlice} from '#discord/hooks/use-slice.ts';
import {createUseState} from '#discord/hooks/use-state.ts';
import {createUseView} from '#discord/hooks/use-view.ts';
import type {RestEmbed} from '#pure/dfx';
import type {str} from '#src/internal/pure/types-pure.ts';
import console from 'node:console';
import {Const} from '..';


export let
  useState    = createUseState([], new URLSearchParams()),
  useEffect   = createUseEffect([], new URLSearchParams()),
  useSlice    = createUseSlice([], new URLSearchParams()),
  useDispatch = createUseDispatch(),
  useView     = createUseView(['', '', '']);


export type HookContext = {
  root   : str;
  embed  : RestEmbed;
  params : URLSearchParams;
  states : str[];
  effects: (() => void)[];
  slices : str[];
  views  : [str, str, str];
};


export const createHookContext = (
  root: str,
  view: str,
  embed: RestEmbed,
): HookContext => {
  const url     = new URL(embed.image?.url ?? 'https://dffp.org');
  const params  = url.searchParams;
  const states  = [] as str[];
  const effects = [] as (() => void)[];
  const slices  = [] as str[];
  const views   = [view, view, Const.ENTRY] as [str, str, str];

  params.set('0_useless_link', '0');
  states.push('0_useless_link');

  useState    = createUseState(states, params);
  useEffect   = createUseEffect(effects, params);
  useSlice    = createUseSlice(slices, params);
  useDispatch = createUseDispatch();
  useView     = createUseView(views);

  return {
    root,
    embed,
    params,
    states,
    slices,
    effects,
    views,
  };
};


export const updateHookContext = (
  context: HookContext,
) => {
  const url = new URL('https://dffp.org');

  console.debug(context.params);

  for (const [id, value] of context.params.entries()) {
    if (context.states.includes(id)) {
      url.searchParams.append(id, value);
    }
  }

  url.searchParams.sort();

  console.debug(url.searchParams);

  return {
    ...context,
    embed: {
      ...context.embed,
      author: {
        ...context.embed.author,
        name: context.embed.author?.name ?? 'DeepFryer',
      },
      image: {
        ...context.embed.image,
        url: url.href,
      },
    },
  };
};
