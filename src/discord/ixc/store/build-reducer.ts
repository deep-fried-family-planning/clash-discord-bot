import type {E} from '#src/internal/pure/effect.ts';
import type {IxDcAction, IxDcState, RDXK, RDXT} from '#src/discord/ixc/store/types.ts';
import {buildCustomId} from '#src/discord/ixc/store/id.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export const buildPredicate = (
    kind: RDXK,
    type: RDXT,
) => ({
    ...buildCustomId({kind, type}),
    withForward: (f: {
        nextKind: RDXK;
        nextType: RDXT;
        forward?: str;
    }) => buildCustomId({
        kind,
        type,
        nextKind: f.nextKind,
        nextType: f.nextType,
        forward : f.forward,
    }),
});


export const buildReducer = <T extends E.Effect<IxDcState, any, any>>(
    reducer: (state: IxDcState, action: IxDcAction) => T,
) => reducer;
