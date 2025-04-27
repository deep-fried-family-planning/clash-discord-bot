import type {ComponentMapItem} from '#src/internal/discord-old/store/derive-state.ts';
import {toId} from '#src/internal/discord-old/store/id-build.ts';
import type {Route, RouteParams} from '#src/internal/discord-old/store/id-routes.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {Maybe} from '#src/internal/pure/types.ts';
import {UI} from 'dfx';
import type {TextInput} from 'dfx/types';

export type MadeText = ReturnType<typeof makeText>;

export const makeText = (
  params: RouteParams | Route,
  options: Partial<Parameters<typeof UI.textInput>[0]>,
  inId?: Route,
) => {
  const id = 'predicate' in params
    ? (inId ?? params)
    : toId(params);

  return {
    id,
    value    : options.value,
    options,
    component: UI.textInput({
      ...options,
      custom_id: id.custom_id,
    } as Parameters<typeof UI.textInput>[0]),
    as: (newId: Route, newOptions?: typeof options) => {
      return makeText(
        newId.params,
        {
          ...options,
          ...newOptions,
        },
      );
    },
    fromMap: (cMap?: Record<str, Maybe<ComponentMapItem>>) => {
      const component = cMap?.[id.predicate];

      return component
        ? makeText(component.id.params, component.original as TextInput, component.id)
        : undefined;
    },
  };
};
