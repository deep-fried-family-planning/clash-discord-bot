import {clearAllParams, clearRoute, getAllParams, setAllParams, setParam} from '#discord/hooks/controller-params.ts';
import {addStateHookId, clearHooks, getFirstView, getHooks, getNextView, setFirstView, setNextView, setViewModifier} from '#discord/hooks/store-hooks.ts';
import type {CxPath} from '#discord/routing/cx-path.ts';
import {DeveloperError} from '#discord/z-errors/developer-error.ts';
import type {RestEmbed} from '#pure/dfx';
import {Ar, pipe} from '#pure/effect';
import {DFFP_URL} from '#src/constants/dffp-alias.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import console from 'node:console';
import {URL} from 'node:url';
import {ExV} from '..';


export type HookId = str;
export type ViewName = str;
export type DialogName = str;
export type ViewModifier = str;


export const startContext = (embeds: ExV.T[], ax: CxPath) => {
  clearHooks();
  clearAllParams();
  clearRoute();


  const url = ExV.controllerUrl(embeds) ?? new URL(DFFP_URL);

  console.log('');
  console.log('[NEW_IX]');
  console.log('initial', url.href);


  setAllParams(new URLSearchParams(url.searchParams));
  setParam('s_0', 'useless_link');
  addStateHookId('s_0');


  setFirstView(ax.view);
  setNextView(ax.view);
  setViewModifier(ax.mod);
};


export const stopContext = () => {
  clearHooks();
  clearAllParams();
  clearRoute();
  return true;
};


export const updateUrlContext = ([controller, ...embeds]: ExV.T[], rx_embeds?: ExV.T[]): RestEmbed[] => {
  const controller_encoded = ExV.encode(controller);
  const url                = new URL(controller_encoded.image!.url);

  console.log('');
  console.log('update_before', url.href);

  const params = getAllParams();
  const hooks  = getHooks();

  const updated = new URLSearchParams();

  for (const id of hooks.states) {
    updated.set(id, params.get(id)!);
  }
  updated.sort();

  const updatedUrl = new URL(`${url.origin}${url.pathname}?${updated.toString()}`);

  console.log('update_after', updatedUrl.href);

  const controller_updated = {
    ...controller_encoded,
    image: {
      ...controller_encoded.image,
      url: updatedUrl.href,
    },
  } as RestEmbed;


  const firstView = getFirstView();
  const nextView  = getNextView();


  if (
    rx_embeds
    && firstView === nextView
  ) {
    const [, ...rxWithoutController] = rx_embeds;
    return [controller_updated, ...ExV.encodeAll(embeds, rxWithoutController)];
  }

  return [controller_updated, ...ExV.encodeAll(embeds)];
};


export const detectDuplicateIds = () => {
  const hooks = getHooks();

  const all = pipe(
    hooks.states,
    Ar.appendAll(hooks.effects.map(([id]) => id)),
    Ar.appendAll(hooks.accessors.map(([id]) => id)),
    Ar.appendAll(hooks.slices.map(([id]) => id)),
    Ar.appendAll(hooks.actions.map(([id]) => id)),
  );

  const unique = pipe(
    all,
    Ar.dedupe,
  );

  if (all.length !== unique.length) {
    throw new DeveloperError({
      data: {
        all,
        unique,
      },
    });
  }

  return all;
};
