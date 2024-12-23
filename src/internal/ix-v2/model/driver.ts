import {Ar, Kv, p} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {IxD} from '#src/internal/discord.ts';
import type {AnyE} from '#src/internal/types.ts';
import type {Routing, View, Slice, Vx} from '#src/internal/ix-v2/model/system.ts';


export const make = <
    DriverState extends AnyE<unknown>,
    Parser extends ReturnType<typeof Routing.make>,
    Slices extends ReturnType<typeof Slice.make>[],
    Views extends Vx.Enum[],
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
            slice : str;
        };
        initialize: (ix: IxD) => DriverState;
        slices    : Slices;
        views     : Views;
        entry     : str;
    },
) => {
    const slices = p(
        config.slices,
        Ar.map((sc) => [sc.name, sc] as const),
        Kv.fromEntries,
    );

    const reducers = p(
        config.slices,
        Ar.flatMap((sc) => p(
            sc.kv,
            Ar.fromRecord,
        )),
        Kv.fromEntries,
    );


    const views = p(
        config.views,
        Kv.fromIterableWith((v) => [v.name, v.view]),
    );


    // const px
    //     = {
    //
    //     } = config.predicates;


    return {
        ...config,
        slices,
        reducers,
        views,
    };
};


