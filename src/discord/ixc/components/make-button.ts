import type {str} from '#src/internal/pure/types-pure.ts';
import {UI} from 'dfx';
import type {Maybe} from '#src/internal/pure/types.ts';
import type {ComponentMapItem} from '#src/discord/ixc/store/derive-state.ts';
import type {Route, RouteParams} from '#src/discord/ixc/store/id-routes.ts';
import type {Button} from 'dfx/types';
import {toId} from '#src/discord/ixc/store/id-build.ts';
import type {IxAction} from '#src/discord/ixc/store/derive-action.ts';


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

        clicked: (ax: IxAction) => ax.id.predicate === id.predicate,

        backward: (newId: Route) => makeButton(
            {
                kind    : id.params.kind,
                type    : id.params.type!,
                backKind: newId.params.nextKind!,
                backType: newId.params.nextType!,
            },
            options,
        ),


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


