import type {Ax} from '#src/internal/discord-old/store/derive-action.ts';
import type {ComponentMapItem} from '#src/internal/discord-old/store/derive-state.ts';
import {toId} from '#src/internal/discord-old/store/id-build.ts';
import type {Route, RouteParams} from '#src/internal/discord-old/store/id-routes.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {Maybe} from '#src/internal/pure/types.ts';
import {UI} from 'dfx';
import type {Button} from 'dfx/types';



export type MadeButton = ReturnType<typeof makeButton>;


export const makeButton = (
  params: Route | RouteParams,
  options: Partial<Parameters<typeof UI.button>[0]>,
  inId?: Route,
) => {
  const id = 'predicate' in params
    ? (inId ?? params)
    : toId(params);


  return {
    id,
    options,
    component: UI.button({
      ...options,
      custom_id: id.custom_id,
    }),
    values: [id.custom_id],

    clicked: (ax: Ax) => ax.id.predicate === id.predicate,

    withData: (data: str[]) => makeButton(
      {
        ...id,
        data,
      },
      options,
    ),


    forward: (newId: Route, forward?: string) => makeButton(
      {
        kind    : id.params.kind,
        type    : id.params.type!,
        nextKind: newId.params.nextKind!,
        nextType: newId.params.nextType!,
        forward : forward,
      },
      options,
    ),
    fwd: (newId: Route, forward?: string) => makeButton(
      {
        ...newId.params,
        ...id.params,
        nextKind: newId.params.kind,
        nextType: newId.params.type!,
        forward : forward,
      },
      options,
    ),
    addForward: (forward?: string) => makeButton(
      {
        ...id.params,
        forward: forward,
      },
      options,
    ),


    render: (newOptions: typeof options) => makeButton(
      id,
      {
        ...options,
        ...newOptions,
      },
      id,
    ),


    as: (newId: Route, newOptions?: typeof options) => {
      return makeButton(
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
        ? makeButton(component.id.params, component.original as Button, component.id)
        : undefined;
    },
    if: (condition: boolean) => {
      return condition
        ? makeButton(params, options, id)
        : undefined;
    },
  };
};
