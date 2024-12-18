import {D, E} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';



export class IxError extends D.TaggedError('IxError')<{
    message: str;
}> {
    static Tag = IxError
}


export const handleIxError = (error: IxError) => E.gen(function * () {

}));
