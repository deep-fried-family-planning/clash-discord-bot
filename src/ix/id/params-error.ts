import {D} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export class ParamsError extends D.TaggedError('RoutingError')<{
    title  : str;
    message: str;
    params : any;
}> {}
