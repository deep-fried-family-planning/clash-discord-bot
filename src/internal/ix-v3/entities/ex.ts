import {D} from '#src/internal/pure/effect';
import type {RestEmbed} from '#src/internal/ix-v2/model/types.ts';
import type {alias, num, ny, str, und} from '#src/internal/pure/types-pure.ts';
import {f} from '#src/internal/pure/effect.ts';
import type {Cx, ExVi} from '.';


type _Meta = {
    _id?    : ExVi.T;
    _alias? : alias;
    _encode?: (ex: RestEmbed, cxs: Record<str, Cx.T>, alias: alias) => RestEmbed;
    _decode?: (ex: RestEmbed, cxs: Record<str, Cx.T>, alias: alias) => RestEmbed;
};


export type T = D.TaggedEnum<{
    None : _Meta & RestEmbed;
    Basic: _Meta & RestEmbed;
}>;
export const C = D.taggedEnum<T>();


// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
export const empty = () => C.None({} as ny);
export const pure = <A extends T>(self: A) => self;
export const data = f(
    pure,
    ({
        _tag,
        _id,
        _alias,
        _encode,
        _decode,
        ...self
    }) => self,
);
export const merge = <A extends T>(a: Partial<A>) => (b: A) => ({
    ...b,
    ...a,
    _id: {
        ...b._id,
        ...a._id,
    },
});
export const mergeId = <A extends T>(a: Partial<A['_id']>) => (b: A) => ({
    ...b,
    _id: {
        ...b._id,
        ...a,
    },
});


export const make = (ex: RestEmbed) => C.Basic({
    ...ex,
});


