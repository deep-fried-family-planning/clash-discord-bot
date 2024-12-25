import type {E} from '#src/internal/pure/effect.ts';
import type {Ax, Cx, IxNamespace, Tx} from '#src/ix/types.ts';


export const makeModel = <
    S extends Tx,
    SE extends E.Effect<S, any, any>,
>(
    input: {
        name: IxNamespace;
        map : S;
        from: (cx: Cx, ax: Ax) => SE;
        flow: {
            [k in keyof S]: (cx: Cx, ax: Ax) => SE
        };
    },
) => {
    return {
        name: input.name,
        map : input.map,
    };
};
