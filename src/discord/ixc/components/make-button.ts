import type {str} from '#src/internal/pure/types-pure.ts';
import {UI} from 'dfx';
import {buildCustomId, parseCustomId} from '#src/discord/ixc/store/id.ts';
import type {Maybe} from '#src/internal/pure/types.ts';
import type {ComponentMapItem} from '#src/discord/ixc/store/derive-state.ts';
import type {Route, RouteParams} from '#src/discord/ixc/store/id-routes.ts';
import type {Button} from 'dfx/types';


export type MadeButton = ReturnType<typeof makeButton>;


export const makeButton = (
    params: RouteParams,
    options: Partial<Parameters<typeof UI.button>[0]>,
    inId?: Route,
) => {
    const id = inId ?? buildCustomId(params);

    return {
        id,
        options,
        component: UI.button({
            ...options,
            custom_id: id.custom_id,
        }),
        as: (newId: Route, newOptions?: typeof options) => {
            return makeButton(
                newId.params,
                {
                    ...options,
                    ...newOptions,
                },
            );
        },
        fromMap: (cMap: Record<str, Maybe<ComponentMapItem>>) => {
            const component = cMap[id.predicate];

            return component
                ? makeButton(component.id.params, component.original, component.id)
                : undefined;
        },
    };
};


export const makeButtonFrom = (
    component: Button,
) => {
    const {custom_id, ...restComponent} = component;
    const id = parseCustomId(custom_id!);

    return makeButton(id.params, restComponent);
};


