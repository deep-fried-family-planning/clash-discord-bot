import type {ComponentMapItem} from '#src/internal/discord-old/store/derive-state.ts';
import {toId} from '#src/internal/discord-old/store/id-build.ts';
import type {Route, RouteParams} from '#src/internal/discord-old/store/id-routes.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {Maybe} from '#src/internal/pure/types.ts';
import {UI} from 'dfx';



export type MadeSelectUser = ReturnType<typeof makeSelectUser>;


export const makeSelectUser = (
  params: RouteParams | Route,
  options: Partial<Parameters<typeof UI.userSelect>[0]>,
  inId?: Route,
) => {
  const id = 'predicate' in params
    ? (inId ?? params)
    : toId(params);

  return {
    id,
    options,
    component: UI.userSelect({
      ...options,
      custom_id: id.custom_id,
    }),
    values: options.default_values?.map((o) => o.id) ?? [],
    render: (newOptions: typeof options) => makeSelectUser(
      params,
      {
        ...options,
        ...newOptions,
      },
      id,
    ),
    as: (newId: Route, newOptions?: typeof options) => {
      return makeSelectUser(
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
        ? makeSelectUser(component.id.params, component.original, component.id)
        : makeSelectUser(id, options, id);
    },
    setDefaultValuesIf: (predicate: str, values: string[]) =>
      predicate === id.predicate
        ? makeSelectUser(id, {
          ...options,
          default_values: values.map((v) => ({
            id  : v as `${bigint}`,
            type: 'user',
          })),
        }, id)
        : makeSelectUser(id, options, id),
  };
};
