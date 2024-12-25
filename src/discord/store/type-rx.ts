import {toId} from '#src/discord/store/id-build.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export const makeId = (
    kind: str,
    type: str,
    ops?: Parameters<typeof toId>[0],
) => toId({...ops, kind, type});
