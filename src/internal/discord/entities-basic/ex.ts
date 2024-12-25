import type {ExVi} from '#dfdis';
import {D} from '#src/internal/pure/effect';
import {f} from '#src/internal/pure/effect.ts';
import type {Embed} from 'dfx/types';


type _Meta = {
    _id?: ExVi.T;
};


export type T = D.TaggedEnum<{
    None : _Meta & Embed;
    Basic: _Meta & Embed;
}>;
export const C = D.taggedEnum<T>();


export const empty = () => C.None({});
export const pure = <A extends T>(self: A) => self;
export const merge = <A extends T>(a: Partial<A>) => (b: A) => ({...b, ...a, _id: {...b._id, ...a._id}});
export const mergeId = <A extends T>(a: Partial<A['_id']>) => (b: A) => ({...b, _id: {...b._id, ...a}});
export const data = f(pure, ({_tag, _id, ...self}) => self);
export const make = (ex: Embed) => C.Basic({
    ...ex,
});
