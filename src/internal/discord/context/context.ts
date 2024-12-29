import {clearAllParams, clearRoute, getAllParams, setAllParams, setParam, setPath} from '#discord/context/controller-params.ts';
import {DeveloperError} from '#discord/entities/errors/developer-error.ts';
import type {CxPath} from '#discord/entities/routing/cx-path.ts';
import {addStateHookId, clearHooks, getFirstView, getHooks, getNextView, setFirstView, setNextView, setViewModifier} from '#discord/simulation/hooks/hooks.ts';
import {updateRestEmbedRef} from '#discord/simulation/hooks/use--rest-embed-ref.ts';
import type {RestEmbed} from '#pure/dfx';
import {Ar, pipe} from '#pure/effect';
import {DFFP_URL} from '#src/constants/dffp-alias.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import console from 'node:console';
import {URL} from 'node:url';
import {ExV} from '../index.ts';


export type HookId = str;
export type ViewName = str;
export type DialogName = str;
export type ViewModifier = str;


export const startContext = (embeds: ExV.Type[], ax: CxPath) => {
  clearHooks();
  clearAllParams();
  clearRoute();


  const url = ExV.controllerUrl(embeds) ?? new URL(DFFP_URL);


  setPath(ax);


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


export const updateUrlContext = ([controller, ...embeds]: ExV.Type[], rx_embeds?: ExV.Type[]): RestEmbed[] => {
  const controller_encoded = ExV.encode(controller);
  const url                = new URL(controller_encoded.image!.url);
  const params             = getAllParams();
  const hooks              = getHooks();
  const updated            = new URLSearchParams();
  const firstView          = getFirstView();
  const nextView           = getNextView();

  for (const id of hooks.states) {
    updated.set(id, params.get(id)!);
  }
  if (firstView === nextView) {
    for (const [id, val] of params.entries()) {
      if (id.startsWith('e_')) {
        updated.set(id, val);
      }
    }
  }
  updated.sort();

  console.info(updated);

  const updatedUrl = new URL(`${url.origin}${url.pathname}?${updated.toString()}`);

  const controller_updated = {
    ...controller_encoded,
    image: {
      ...controller_encoded.image,
      url: updatedUrl.href,
    },
  } as RestEmbed;


  if (
    rx_embeds
    && firstView === nextView
  ) {
    const [, ...rxWithoutController] = rx_embeds;

    const updated = updateRestEmbedRef(embeds);

    return [controller_updated, ...ExV.encodeAll(updated, rxWithoutController)];
  }

  return [controller_updated, ...pipe(updateRestEmbedRef(embeds), ExV.encodeAll)];
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
