import type {bool, und} from '#src/internal/pure/types-pure.ts';
import type {Embed} from 'dfx/types';

export const embedIf = (condition: Embed | bool | und, embed: Embed) => {
    if (condition) {
        return embed;
    }
    return undefined;
};
