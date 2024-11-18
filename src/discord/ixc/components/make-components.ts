import type {str} from '#src/internal/pure/types-pure.ts';
import {UI} from 'dfx';
import {buildCustomId, parseCustomId} from '#src/discord/ixc/store/id.ts';
import type {Maybe} from '#src/internal/pure/types.ts';
import type {ComponentMapItem} from '#src/discord/ixc/store/derive-state.ts';
import type {Route, RouteParams} from '#src/discord/ixc/store/id-routes.ts';
import type {Button, SelectMenu} from 'dfx/types';


export type MadeButton = ReturnType<typeof makeButton>;
export type MadeSelect = ReturnType<typeof makeSelect>;


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


//
//
// export const makeComponentButton = (
//     kind: RDXK,
//     type: RDXT,
//     options: Partial<Parameters<typeof UI.button>[0]>,
//     data: string[] = [],
// ) => {
//     const id = buildCustomId({
//         kind,
//         type,
//         data,
//     });
//
//     const button = UI.button({
//         ...options,
//         custom_id: id.id,
//     });
//
//     const predicate = `${kind}/${type}`;
//
//     return {
//         kind,
//         type,
//         options,
//         data,
//         predicate,
//         component: button,
//         as       : (p: ReturnType<typeof buildPredicate>, newOptions?: typeof options, data?: str[]) => {
//             return makeComponentButton(p.kind, p.type, {
//                 ...options,
//                 ...newOptions,
//             }, data);
//         },
//         fromMap: (componentMap: Record<str, Maybe<ComponentMapItem>>) =>
//             componentMap[predicate]
//                 ? makeComponentButton(kind, type,
//                     {
//                         ...componentMap[predicate].original,
//                     },
//                     componentMap[predicate].id.params.data,
//                 )
//                 : undefined,
//     };
// };
//
//
// export const makeComponentSelect = (
//     kind: RDXK,
//     type: RDXT,
//     options: Partial<Parameters<typeof UI.select>[0]>,
//     data: string[] = [],
// ) => {
//     const id = buildCustomId({
//         kind,
//         type,
//         data,
//     });
//
//     const button = UI.select({
//         options  : options.options ?? [],
//         ...options,
//         custom_id: id.id,
//     });
//
//     const predicate = `${kind}/${type}`;
//
//     return {
//         predicate,
//         component: button,
//
//         as: (p: ReturnType<typeof buildPredicate>, newOptions?: typeof options, data?: str[]) => {
//             return makeComponentSelect(p.kind, p.type, {
//                 ...options,
//                 ...newOptions,
//             }, data);
//         },
//         fromMap: (componentMap: Record<str, Maybe<ComponentMapItem>>) =>
//             componentMap[predicate]
//                 ? makeComponentSelect(kind, type,
//                     {
//                         ...componentMap[predicate].original,
//                     },
//                     componentMap[predicate].id.params.data,
//                 )
//                 : undefined,
//     };
// };
