import {D} from '#src/internal/pure/effect';
import type {Cx, Ux} from '.';
import type {ny, str, und} from '#src/internal/pure/types-pure.ts';
import {f} from '#src/internal/pure/effect.ts';
import type {EnumJust} from '#src/internal/ix-v3/entities/util.ts';


export type E = {
    Map: {
        data: Record<str, {
            _data?   : str | und;
            rx?      : Cx.T;
            ax?      : Cx.T;
            axs?     : Cx.T;
            scp?     : Cx.T;
            scn?     : Cx.T;
            sxp?     : Cx.T;
            sxn?     : Cx.T;
            vx?      : Cx.T;
            tx?      : Cx.T;
            snapshots: {
                [k in Ux.T['_tag']]?: EnumJust<Ux.T, k> | und
            };
        }>;
    };
};
export type T = D.TaggedEnum<E>;
export const C = D.taggedEnum<T>();


export const empty = () => C.Map({data: {}});
export const pure = <A extends T>(self: A) => self;
export const lift = f(pure, (self) => self.data);
export const set = <
    A extends Ux.T,
>(
    _data: str,
    data: A,
) => f(
    lift,
    (uxs) => {
        uxs[_data] ??= {_data: _data, snapshots: {}};
        uxs[_data].snapshots = {
            ...uxs[_data].snapshots,
            [data._tag]: data,
        };
        return uxs;
    },
    (uxs) => C.Map({data: uxs}),
);

