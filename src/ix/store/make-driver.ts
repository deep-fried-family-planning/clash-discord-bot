import {Ar, D, Kv, p} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {IxD} from '#src/internal/discord.ts';
import type {AnyE} from '#src/internal/types.ts';
import type {makeParams} from '#src/ix/id/params.ts';
import type {makeView} from '#src/ix/store/make-view.ts';
import type {createComponent} from '#src/ix/store/make-component.ts';
import {type makeSlice, slicePredicate} from '#src/ix/store/make-slice.ts';


export const makeDriver = <
    DriverState extends AnyE<unknown>,
    Parser extends ReturnType<typeof makeParams>,
    Slices extends ReturnType<typeof makeSlice>[],
    Views extends ReturnType<typeof makeView>[],
>(
    config: {
        name      : str;
        routing   : Parser;
        predicates: {
            action: (id: {[k in keyof Parser['type'] as str]: str}) => str;
            view  : (id: Parser['type']) => str;
            cmode : str;
            ctype : str;
            entry : (id: Parser['type']) => boolean;
            delete: (id: Parser['type']) => boolean;
        };
        initialize: (ix: IxD) => DriverState;
        slices    : Slices;
        views     : Views;
        components: ReturnType<typeof createComponent>[];
    },
) => {
    const sliceStates = p(
        config.slices,
        Ar.map((sc) => p(
            sc.sx,
            Kv.mapEntries((v) => [slicePredicate(sc.name, v), sc.sx] as const),
            Kv.toEntries,

        )),
        Ar.flatten,
        Kv.fromEntries,
    );

    const reducers = p(
        config.slices,
        Ar.flatMap((sc) => p(
            sc.actions,
            Ar.fromRecord,
        )),
        Kv.fromEntries,
    );


    const views = p(
        config.views,
        Kv.fromIterableWith((v) => [v.name, v.view]),
    );


    const components = p(
        config.components,
        Kv.fromIterableWith((c) => [c, c]),
    );


    return {
        ...config,
        sliceStates,
        reducers,
        views,
        components,
    };
};


export class DriverError extends D.TaggedError('DriverError')<{
    message: str;
}> {}
