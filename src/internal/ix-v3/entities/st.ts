import {D} from '#src/internal/pure/effect';
import {Cx} from '.';
import {f} from '#src/internal/pure/effect.ts';


export type E = {
    None   : {data: Cx.T};
    Rx     : {data: Cx.T};
    Ax     : {data: Cx.T};
    Ex     : {data: Cx.T};
    Sc_prev: {data: Cx.T};
    Sc_next: {data: Cx.T};
    S_prev : {data: Cx.T};
    S_next : {data: Cx.T};
    Vx0    : {data: Cx.T};
    Vx     : {data: Cx.T};
    Tx     : {data: Cx.T};
};
export type T = D.TaggedEnum<E>;
export const C = D.taggedEnum<T>();


export const empty = () => C.None({data: Cx.empty()});
export const pure = <A extends T>(self: A) => self;
export const lift = f(pure, (self) => self.data);
