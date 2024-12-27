import {createUseAccessor, createUseDispatch, createUseEffect, createUseSlice, createUseState, createUseView} from '#discord/hooks/hooks.ts';
import type {RestEmbed} from '#pure/dfx';
import type {str} from '#src/internal/pure/types-pure.ts';
import {Const} from '..';


export let
  useState    = createUseState([], new URLSearchParams()),
  useEffect   = createUseEffect([], new URLSearchParams()),
  useSlice    = createUseSlice([], new URLSearchParams()),
  useDispatch = createUseDispatch(),
  useView     = createUseView(['', '', '']),
  useAccessor = createUseAccessor();


export type HookContext = {
  root   : str;
  embed  : RestEmbed;
  params : URLSearchParams;
  states : str[];
  effects: [str, () => void][];
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
  const effects = [] as [str, () => void][];
  const slices  = [] as str[];
  const views   = [view, view, Const.ENTRY] as [str, str, str];

  params.set('0_useless_link', '0');
  states.push('0_useless_link');

  useState    = createUseState(states, params);
  useEffect   = createUseEffect(effects, params);
  useSlice    = createUseSlice(slices, params);
  useDispatch = createUseDispatch();
  useView     = createUseView(views);
  useAccessor = createUseAccessor();

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
  embeds: RestEmbed[],
) => {
  const [first, ...restEmbeds] = embeds;

  const url = new URL('https://dffp.org');

  for (const [id, value] of context.params.entries()) {
    if (context.states.includes(id)) {
      url.searchParams.append(id, value);
    }
  }

  url.searchParams.sort();

  const controller = {
    ...first,
    image: {
      ...first.image,
      url: url.href,
    },
  };

  return {
    ...context,
    embeds: [controller, ...restEmbeds],
  };
};
