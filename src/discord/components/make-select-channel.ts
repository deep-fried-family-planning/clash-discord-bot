import type {Route, RouteParams} from '#src/discord/store/id-routes.ts';
import {UI} from 'dfx';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {Maybe} from '#src/internal/pure/types.ts';
import type {ComponentMapItem} from '#src/discord/store/derive-state.ts';
import {toId} from '#src/discord/store/id-build.ts';


export type MadeSelectChannel = ReturnType<typeof makeSelectChannel>;


export const makeSelectChannel = (
    params: RouteParams | Route,
    options: Partial<Parameters<typeof UI.channelSelect>[0]>,
    inId?: Route,
) => {
    const id = 'predicate' in params
        ? (inId ?? params)
        : toId(params);

    return {
        id,
        options,
        component: UI.channelSelect({
            ...options,
            custom_id: id.custom_id,
        }),
        values: options.default_values?.map((o) => o.id) ?? [],
        render: (newOptions: typeof options) => makeSelectChannel(
            params,
            {
                ...options,
                ...newOptions,
            },
            id,
        ),
        as: (newId: Route, newOptions?: typeof options) => {
            return makeSelectChannel(
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
                ? makeSelectChannel(component.id.params, component.original, component.id)
                : makeSelectChannel(id, options, id);
        },
        setDefaultValuesIf: (predicate: str, values: string[]) =>
            predicate === id.predicate
                ? makeSelectChannel(id, {
                    ...options,
                    default_values: values.map((v) => ({
                        id  : v as `${bigint}`,
                        type: 'channel',
                    })),
                }, id)
                : makeSelectChannel(id, options, id),
    };
};
