import type {Route, RouteParams} from '#src/discord/ixc/store/id-routes.ts';
import {UI} from 'dfx';
import {buildCustomId, parseCustomId} from '#src/discord/ixc/store/id.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {Maybe} from '#src/internal/pure/types.ts';
import type {ComponentMapItem} from '#src/discord/ixc/store/derive-state.ts';
import type {SelectMenu} from 'dfx/types';


export type MadeSelect = ReturnType<typeof makeSelect>;


export const makeSelect = (
    params: RouteParams,
    options: Partial<Parameters<typeof UI.select>[0]>,
    inId?: Route,
) => {
    const id = inId ?? buildCustomId(params);

    return {
        id,
        options,
        component: UI.select({
            ...options,
            options  : options.options ?? [],
            custom_id: id.custom_id,
        }),
        as: (newId: Route, newOptions?: typeof options) => {
            return makeSelect(
                newId.params,
                {
                    ...options,
                    ...newOptions,
                },
            );
        },
        fromMap: (cMap: Record<str, Maybe<ComponentMapItem>>) => {
            console.debug('[FROM_MAP]', id.predicate);

            const component = cMap[id.predicate];

            return component
                ? makeSelect(component.id.params, component.original, component.id)
                : undefined;
        },
        getDefaultValues: () => {
            const returnable = options.options?.filter((o) => o.default) ?? [];

            console.debug('[getDefaultValues]', options.options);
            console.debug('[getDefaultValues]', returnable);

            return returnable;
        },
        setDefaultValues: (values: string[]) => {
            return makeSelect(
                id.params,
                {
                    ...options,
                    options: options.options?.map((o) => ({
                        ...o,
                        default: values.includes(o.value),
                    })) ?? [],
                },
                id,
            );
        },
    };
};


export const makeSelectFrom = (
    component: SelectMenu,
) => {
    const {custom_id, ...restComponent} = component;
    const id = parseCustomId(custom_id);

    return makeSelect(id.params, restComponent);
};
