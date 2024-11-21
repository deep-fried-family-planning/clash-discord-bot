import type {Route, RouteParams} from '#src/discord/ixc/store/id-routes.ts';
import {UI} from 'dfx';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {Maybe} from '#src/internal/pure/types.ts';
import type {ComponentMapItem} from '#src/discord/ixc/store/derive-state.ts';
import {toId} from '#src/discord/ixc/store/id-build.ts';


export type MadeSelect = ReturnType<typeof makeSelect>;


export const makeSelect = (
    params: RouteParams | Route,
    options: Partial<Parameters<typeof UI.select>[0]>,
    inId?: Route,
) => {
    const id = 'predicate' in params
        ? (inId ?? params)
        : toId(params);

    return {
        id,
        options,
        component: UI.select({
            ...options,
            options  : options.options ?? [],
            custom_id: id.custom_id,
        }),
        values: options.options?.filter((o) => o.default).map((o) => o.value) ?? [],
        render: (newOptions: typeof options) => makeSelect(
            params,
            {
                ...options,
                ...newOptions,
            },
            id,
        ),
        as: (newId: Route, newOptions?: typeof options) => {
            return makeSelect(
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
                ? makeSelect(component.id.params, component.original, component.id)
                : makeSelect(id, options, id);
        },
        getDefaultValues: () => {
            const returnable = options.options?.filter((o) => o.default) ?? [];

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
        setDefaultValuesIf: (predicate: str, values: string[]) =>
            predicate === id.predicate
                ? makeSelect(id, {
                    ...options,
                    options: options.options?.map((o) => ({
                        ...o,
                        default: values.includes(o.value),
                    })) ?? [],
                }, id)
                : makeSelect(id, options, id),
    };
};
