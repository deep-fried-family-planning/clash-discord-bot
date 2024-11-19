import type {E} from '#src/internal/pure/effect.ts';
import type {IxAction, IxState, RDXK, RDXT} from '#src/discord/ixc/store/types.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {buildCustomId} from '#src/discord/ixc/store/id-build.ts';
/* eslint-disable @typescript-eslint/no-explicit-any */


export const makeId = (
    kind: RDXK,
    type: RDXT,
    ops?: Parameters<typeof buildCustomId>[0],
) => ({
    ...buildCustomId({...ops, kind, type}),
    withForward: (f: {
        nextKind?: RDXK | undefined;
        nextType?: RDXT | undefined;
        forward? : str | undefined;
    }) => buildCustomId({
        kind,
        type,
        nextKind: f.nextKind!,
        nextType: f.nextType!,
        forward : f.forward!,
    }),
    get fwd() {
        return (params: Parameters<typeof buildCustomId>[0]) => makeId(kind, type, {
            ...params,
            nextKind: params.kind,
            nextType: params.type!,
        });
    },
});


export const buildReducer = <
    T extends E.Effect<IxState, any, any>,
>(
    reducer: (s: IxState, ax: IxAction) => T,
) => reducer;
