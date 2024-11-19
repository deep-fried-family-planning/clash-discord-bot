import type {E} from '#src/internal/pure/effect.ts';
import type {IxAction, IxState, RDXK} from '#src/discord/ixc/store/types.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {toId} from '#src/discord/ixc/store/id-build.ts';
/* eslint-disable @typescript-eslint/no-explicit-any */


export const makeId = (
    kind: RDXK,
    type: str,
    ops?: Parameters<typeof toId>[0],
) => ({
    ...toId({...ops, kind, type}),
    withForward: (f: {
        nextKind?: RDXK | undefined;
        nextType?: str | undefined;
        forward? : str | undefined;
    }) => toId({
        kind,
        type,
        nextKind: f.nextKind!,
        nextType: f.nextType!,
        forward : f.forward!,
    }),
    // get fwd() {
    //     return (params: Parameters<typeof toId>[0]) => makeId(kind, type, {
    //         ...params,
    //         nextKind: params.kind,
    //         nextType: params.type,
    //     });
    // },
});


export const typeRx = <
    T extends E.Effect<IxState, any, any>,
>(
    reducer: (s: IxState, ax: IxAction) => T,
) => reducer;


export const typeRxHelper = <
    T extends E.Effect<any, any, any>,
>(
    helper: (s: IxState, ax: IxAction) => T,
) => helper;
