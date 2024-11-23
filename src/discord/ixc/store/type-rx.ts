import type {E} from '#src/internal/pure/effect.ts';
import type {RDXK} from '#src/discord/ixc/store/types.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {toId} from '#src/discord/ixc/store/id-build.ts';
import type {IxState} from '#src/discord/ixc/store/derive-state.ts';
import type {IxAction} from '#src/discord/ixc/store/derive-action.ts';
/* eslint-disable @typescript-eslint/no-explicit-any */


export const makeId = (
    kind: RDXK,
    type: str,
    ops?: Parameters<typeof toId>[0],
) => toId({...ops, kind, type});


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
