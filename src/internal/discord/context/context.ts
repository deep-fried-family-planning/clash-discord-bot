import {clearAllParams, clearRoute, getAllParams, setAllParams, setParam, setPath} from '#discord/context/controller-params.ts';
import type {Cx} from '#discord/entities/basic';
import {Ex} from '#discord/entities/basic';
import {DeveloperError} from '#discord/entities/errors/developer-error.ts';
import {addStateHookId, clearHooks, getFirstView, getHooks, getNextView, setFirstView, setNextView, setViewModifier} from '#discord/entities/hooks/hooks.ts';
import {updateRestEmbedRef} from '#discord/entities/hooks/use-rest-embed-ref.ts';
import type {RestEmbed} from '#pure/dfx';
import {Ar, pipe} from '#pure/effect';
import type {str} from '#src/internal/pure/types-pure.ts';


export type HookId = str;
export type ViewName = str;
export type DialogName = str;
export type ViewModifier = str;


export const startContext = ([controller]: Ex.Grid, ax: Cx.Path) => {
  clearHooks();
  clearAllParams();
  clearRoute();

  setPath(ax);

  setAllParams(new URLSearchParams(controller.query));
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


export const updateUrlContext = ([controller, ...embeds]: Ex.Grid, rx_embeds?: Ex.Grid): RestEmbed[] => {
  const params    = getAllParams();
  const hooks     = getHooks();
  const updated   = new URLSearchParams();
  const firstView = getFirstView();
  const nextView  = getNextView();

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

  const updatedController = pipe(controller, Ex.set('query', updated));

  return pipe(
    [updatedController, ...embeds],
    updateRestEmbedRef,
    Ex.encodeGrid(
      rx_embeds && firstView === nextView
        ? rx_embeds
        : [],
    ),
  );
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
