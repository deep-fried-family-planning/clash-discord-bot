import type {ExV} from '#dfdis';
import type {str} from '#src/internal/pure/types-pure.ts';


export type ComponentRoute = {
    version: str;
};


export type DialogRoute = {
    version: str;
};


export type EmbedRoute = {
    version: str;
    type   : ExV.T['_tag'];
};
