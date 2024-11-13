/* eslint-disable @typescript-eslint/no-explicit-any */

import type {E} from '#src/internals/re-exports/effect.ts';
import type {CompIx, IxComp} from '#src/internals/re-exports/discordjs.ts';
import type {UI} from 'dfx';
import {Ix} from 'dfx';

type Menu<R extends E.Effect<any, any, any>> = () => {
    is: (data: IxComp) => boolean;
    in: () => UI.UIComponent;
    do: (ix: CompIx, data: IxComp) => R;
};

export const makeMenu = <
    R extends E.Effect<any, any, any>,
    Comp extends UI.UIComponent,
>(type: (input: Partial<Comp>) => Comp, m: {
    custom_id: string;
    options  : (o?: Partial<Comp>) => Partial<Comp>;
    handle   : (ix: CompIx, data: IxComp) => R;
}) => ({
    is: Ix.idStartsWith(m.custom_id),
    in: (o?: Partial<Comp>) => type({
        ...m.options(o),
        custom_id: m.custom_id,
    }),
    do: m.handle,
});
