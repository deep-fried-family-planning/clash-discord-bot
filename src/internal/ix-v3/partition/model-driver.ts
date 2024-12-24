import type {CxVi, ExVi, Sc} from '../entities';
import {VxTree} from '../entities';
import type {str} from '#src/internal/pure/types-pure.ts';
import {Kv, p} from '#src/internal/pure/effect.ts';


export const make = <
    Scs extends ReturnType<typeof Sc.make>[],
    RootNode extends Extract<VxTree.T, {_tag: 'Root'}>,
>(
    config: {
        name      : str;
        root      : RootNode;
        routing_cx: CxVi.VirtualRouter;
        routing_ex: ExVi.VirtualRouter;
        slices    : Scs;
    },
) => {
    const slices = p(
        config.slices,
        Kv.fromIterableWith((sc) => [sc.name, sc]),
    );

    return {
        name      : config.name,
        root      : config.root,
        nodes     : VxTree.shallow(config.root),
        routing_cx: config.routing_cx,
        routing_ex: config.routing_ex,
        slices,
    };
};
