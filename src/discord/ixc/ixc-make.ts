/* eslint-disable @typescript-eslint/no-explicit-any */

import {E, pipe} from '#src/internal/pure/effect.ts';
import {UI} from 'dfx';
import type {IxR, IxRE} from '#src/discord/util/discord.ts';
import type {IxD, IxDc} from '#src/discord/util/discord.ts';
import {mapL} from '#src/internal/pure/pure-list.ts';


type Menu<R extends EAny, C extends IxcF, D > = (
    name: string,
    type: C,
    comp: Partial<Parameters<C>[0]>,
    handle: (ix: IxD, data: D, self: Omit<ReturnType<Menu<R, C, D>>, 'message'>) => R,
) => {
    namespace: string;
    predicate: (id: string) => boolean;
    built    : UI.UIComponent;
    with     : (append_id?: string, comp?: Partial<Parameters<C>[0]>) => UI.UIComponent;
    message  : (ix: IxD, data: D) => R;
};


export const makeEntryMenu = <R extends E_Entry, C extends IxcF, D >(
    name: string,
    type: C,
    comp: Partial<Parameters<C>[0]>,
    handle: (ix: IxD, data: D) => R,
) => ({
    predicate: (id?: string) => !!id?.startsWith(`E_${name}`),
    built    : type({...comp, custom_id: `E_${name}`}),
    with     : (a = '', o?: Partial<Parameters<C>[0]>) => type({...comp, ...o, custom_id: `E_${name}${a}`}),
    private  : handle,
});


export const makeMenu = <R extends E_Edit, C extends IxcF, D = IxDc >(
    name: string,
    type: C,
    comp: Partial<Parameters<C>[0]>,
    handle: (ix: IxD, data: D, self: Omit<ReturnType<Menu<R, C, D>>, 'message'>) => R,
) => {
    const namespace = `C_${name}`;

    const built = type({
        ...comp,
        custom_id: namespace,
    } as any);

    const self = {
        namespace,
        predicate: (id?: string) => !!id?.startsWith(`E_${name}`),
        built,
        with     : (a = '', o?: Partial<Parameters<C>[0]>) => type({...comp, ...o, custom_id: `${namespace}${a}`} as any),
    };

    return {
        ...self,
        get message() {
            return (ix: IxD, data: D) => handle(ix, data, self);
        },
    };
};


export const makeSelectSubmit = <R>(
    name: string,
    previous: ReturnType<typeof makeMenu>,
    next: ReturnType<typeof makeMenu>,
    comp: CSelect,
) => {
    const back = makeMenu(`BB/${name}`, UI.button, {label: 'Back'}, previous.message);

    const submit = makeMenu(`SB/${name}`, UI.button, {label: 'Next'}, next.message);

    const selector = makeMenu(`SS/${name}`, UI.select, {options: comp.options}, (ix, data: IxDc, self) => E.gen(function * () {
        if (data.custom_id === self.namespace) {
            const options = pipe(comp.options, mapL((o) => ({
                ...o,
                default: o.value === data.values![0].value,
            })));

            return {
                ...ix.message,
                components: UI.grid([
                    [self.with('', {options})],
                    [back.built, submit.with(`/${data.values!.map((v) => v.value).join(':')}`)],
                ]),
            };
        }

        return {
            ...ix.message,
            components: UI.grid([
                [self.with('')],
                [back.built, submit.with(`/${data.values!.map((v) => v.value).join(':')}`)],
            ]),
        };
    }));

    return [
        back, selector, submit,
    ];
};


type CSelect = Parameters<typeof UI.select>[0];
type IxcF = (...p: any) => UI.UIComponent;
type IxcFn =
    | typeof UI.select
    | typeof UI.channelSelect
    | typeof UI.userSelect
    | typeof UI.roleSelect
    | typeof UI.mentionableSelect
    | typeof UI.button;


type E_Entry = E.Effect<Partial<IxR['data']> | undefined, any, any>;
type E_Edit = E.Effect<Partial<IxRE> | undefined, any, any>;
type EAny = E.Effect<any, any, any>;
