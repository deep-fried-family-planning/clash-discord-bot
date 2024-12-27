import type {Slice} from '#dfdis';
import type {makeView} from '#discord/entities/view.ts';
import {Kv, p} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export const make = <
    Scs extends ReturnType<typeof Slice.make>[],
>(
    config: {
        name  : str;
        slices: Scs;
        views : ReturnType<typeof makeView>[];
    },
) => {
    const slices = p(
        config.slices,
        Kv.fromIterableWith((sc) => [sc.name, sc]),
    );

    const views = p(
        config.views,
        Kv.fromIterableWith((view) => [view.name, view]),
    );

    return {
        name: config.name,
        slices,
        views,
    };
};
