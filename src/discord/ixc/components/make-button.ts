import type {str} from '#src/internal/pure/types-pure.ts';
import {UI} from 'dfx';
import type {Maybe} from '#src/internal/pure/types.ts';
import type {ComponentMapItem} from '#src/discord/ixc/store/derive-state.ts';
import type {Route, RouteParams} from '#src/discord/ixc/store/id-routes.ts';
import type {Button} from 'dfx/types';
import {toId} from '#src/discord/ixc/store/id-build.ts';
import {fromId} from '#src/discord/ixc/store/id-parse.ts';


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

        backward: (newId: Route) => makeButton(
            {
                kind    : id.params.kind,
                type    : id.params.type!,
                backKind: newId.params.nextKind!,
                backType: newId.params.nextType!,
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
        with: (newOptions: typeof options) => makeButton(
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
        withFwd: (newId: Route, forward?: string, newOptions?: typeof options) => {
            return makeButton(
                {
                    kind    : newId.params.nextKind!,
                    type    : newId.params.nextType!,
                    nextKind: id.params.nextKind!,
                    nextType: id.params.nextKind!,
                    forward,
                },
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


export const makeButtonFrom = (
    component: Button,
) => {
    const {custom_id, ...restComponent} = component;
    const id = fromId(custom_id!);

    return makeButton(id.params, restComponent);
};


