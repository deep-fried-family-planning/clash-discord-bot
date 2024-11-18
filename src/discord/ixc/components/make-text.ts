import type {str} from '#src/internal/pure/types-pure.ts';
import {UI} from 'dfx';
import {buildCustomId, parseCustomId} from '#src/discord/ixc/store/id.ts';
import type {Maybe} from '#src/internal/pure/types.ts';
import type {ComponentMapItem} from '#src/discord/ixc/store/derive-state.ts';
import type {Route, RouteParams} from '#src/discord/ixc/store/id-routes.ts';
import type {TextInput} from 'dfx/types';


export type makeText = ReturnType<typeof makeText>;


export const makeText = (
    params: RouteParams,
    options: Partial<Parameters<typeof UI.textInput>[0]>,
    inId?: Route,
) => {
    const id = inId ?? buildCustomId(params);

    return {
        id,
        options,
        component: UI.textInput({
            ...options,
            custom_id: id.custom_id,
        }),
        as: (newId: Route, newOptions?: typeof options) => {
            return makeText(
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
                ? makeText(component.id.params, component.original as TextInput, component.id)
                : undefined;
        },
    };
};


export const makeTextFrom = (
    component: TextInput,
) => {
    const {custom_id, ...restComponent} = component;
    const id = parseCustomId(custom_id);

    return makeText(id.params, restComponent);
};


