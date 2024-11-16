import {UI} from 'dfx';
import type {IxD, IxDc} from '#src/discord/util/discord.ts';
import type {SelectOption} from 'dfx/types';
import {type IXCEffect, stdNamespace} from '#src/discord/ixc/make/namespace.ts';


export const makeButton = (
    namespace: string,
    ops: Partial<Parameters<typeof UI.button>[0]>,
) => {
    const button = UI.button({
        ...ops,
        custom_id: namespace,
    });

    const self = {
        namespace,
        component    : button,
        componentWith: (...p: Parameters<typeof makeButton>) => UI.button({
            ...ops,
            ...p[1],
            custom_id: stdNamespace(namespace, p[0]),
        }),
    };

    return {
        ...self,
        bind: <
            T extends (ix: IxD, d: IxDc, s: typeof self) => IXCEffect,
        >(handler: T) => ({
            predicate: (id: string) => id.startsWith(namespace),
            handler  : (ix: IxD, d: IxDc) => handler(ix, d, self),
        }),
    };
};


export const makeStringSelect = (
    namespace: string,
    ops: Partial<Parameters<typeof UI.select>[0]> & {options: SelectOption[]},
) => {
    const button = UI.select({...ops, custom_id: namespace});

    const self = {
        namespace,
        ops,
        component    : button,
        componentWith: (...p: Parameters<typeof makeStringSelect>) => {
            return UI.select({
                ...ops,
                ...p[1],
                custom_id: stdNamespace(namespace, p[0]),
            });
        },
    };

    return {
        ...self,
        bind: <
            T extends (ix: IxD, d: IxDc, s: typeof self) => IXCEffect,
        >(handler: T) => ({
            predicate: (id: string) => id.startsWith(namespace),
            handler  : (ix: IxD, d: IxDc) => handler(ix, d, self),
        }),
    };
};
