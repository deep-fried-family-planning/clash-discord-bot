import type {str} from '#src/internal/pure/types-pure.ts';
import {toId} from '#src/discord/ixc/store/id-build.ts';


export const makeId = (
    kind: str,
    type: str,
    ops?: Parameters<typeof toId>[0],
) => toId({...ops, kind, type});
