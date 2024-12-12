import type {IxD} from '#src/internal/discord.ts';
import type {Rx} from '#src/ix/store/types.ts';
import {p, pipe} from '#src/internal/pure/effect.ts';


export const rx = (ix: IxD) => {
    const cmap = p(
        ix.message!,
    );


    return {};
};
