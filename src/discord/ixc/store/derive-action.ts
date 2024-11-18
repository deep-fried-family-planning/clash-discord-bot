import type {IxD, IxDc} from '#src/discord/util/discord.ts';
import {CSL, E} from '#src/internal/pure/effect.ts';
import type {RDXK} from '#src/discord/ixc/store/types.ts';
import type {IxDcAction, IxDcState, RDXT} from '#src/discord/ixc/store/types.ts';
import {parseCustomId} from '#src/discord/ixc/store/id.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {inspect} from 'node:util';
/* eslint-disable @typescript-eslint/no-explicit-any */


export type IxDcReducerFn<T extends E.Effect<IxDcState, any, any>> = {
    predicate: str;
    kind     : str;
    type     : str;
    reducer  : (state: IxDcState, action: IxDcAction) => T;
};


export const bindAction = <T extends E.Effect<IxDcState, any, any>>(
    kind: RDXK,
    type: RDXT,
    reducer: (state: IxDcState, action: IxDcAction) => T,
) => ({
    predicate: `${kind}/${type}`,
    kind,
    type,
    reducer,
} as const satisfies IxDcReducerFn<T>);


export const deriveAction = (ix: IxD, d: IxDc) => E.gen(function * () {
    yield * CSL.debug('[CUSTOM_ID]', d.custom_id);

    const id = parseCustomId(d.custom_id);

    const values = d.values?.map((d) => ({
        type : 'string',
        value: d as unknown as str,
    })) ?? [];

    const action = {
        id,
        predicate: id.predicate,
        selected : values,
        forward  : id.params.forward,
        original : d,
    } as const satisfies IxDcAction;

    yield * CSL.debug('[ACTION]', inspect(action, true, null));

    return action;
});


