import type {Route, RouteParams} from '#src/discord/store/id-routes.ts';
import {UI} from 'dfx';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {Maybe} from '#src/internal/pure/types.ts';
import type {ComponentMapItem} from '#src/discord/store/derive-state.ts';
import {toId} from '#src/discord/store/id-build.ts';


export type MadeSelectRole = ReturnType<typeof makeSelectRole>;


export const makeSelectRole = (
    params: RouteParams | Route,
    options: Partial<Parameters<typeof UI.roleSelect>[0]>,
    inId?: Route,
) => {
    const id = 'predicate' in params
        ? (inId ?? params)
        : toId(params);

    return {
        id,
        options,
        component: UI.roleSelect({
            ...options,
            custom_id: id.custom_id,
        }),
        values: options.default_values?.map((o) => o.id) ?? [],
        render: (newOptions: typeof options) => makeSelectRole(
            params,
            {
                ...options,
                ...newOptions,
            },
            id,
        ),
        as: (newId: Route, newOptions?: typeof options) => {
            return makeSelectRole(
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
                ? makeSelectRole(component.id.params, component.original, component.id)
                : makeSelectRole(id, options, id);
        },
        setDefaultValuesIf: (predicate: str, values: string[]) =>
            predicate === id.predicate
                ? makeSelectRole(id, {
                    ...options,
                    default_values: values.map((v) => ({
                        id  : v as `${bigint}`,
                        type: 'role',
                    })),
                }, id)
                : makeSelectRole(id, options, id),
    };
};
