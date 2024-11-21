import type {str} from '#src/internal/pure/types-pure.ts';
import {UI} from 'dfx';
import type {Maybe} from '#src/internal/pure/types.ts';
import type {ComponentMapItem} from '#src/discord/ixc/store/derive-state.ts';
import type {Route, RouteParams} from '#src/discord/ixc/store/id-routes.ts';
import type {TextInput} from 'dfx/types';
import {fromId} from '#src/discord/ixc/store/id-parse.ts';
import {toId} from '#src/discord/ixc/store/id-build.ts';


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


export const makeTextFrom = (
    component: TextInput,
) => {
    const {custom_id, ...restComponent} = component;
    const id = fromId(custom_id);

    return makeText(id.params, restComponent);
};


