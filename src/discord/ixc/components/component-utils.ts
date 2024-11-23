import type {bool, und} from '#src/internal/pure/types-pure.ts';
import type {Embed} from 'dfx/types';
import {FOOTER} from '#src/discord/ixc/store/types.ts';
import {COLOR, nColor} from '#src/internal/constants/colors.ts';


export const unset = undefined;


export const embedIf = (condition: Embed | bool | und, embed?: Embed) => {
    if (condition) {
        return embed;
    }
    return undefined;
};


export const isViewer = (embed?: Embed) => embed?.author?.name === FOOTER.VIEWING;
export const asViewer = (embed?: Embed): Embed => {
    return {
        ...embed,
        author: {
            name: FOOTER.VIEWING,
        },
    };
};

export const isEditor = (embed?: Embed) => embed?.author?.name === FOOTER.EDITING;
export const asEditor = (embed?: Embed): Embed => {
    return {
        ...embed,
        author: {
            name: FOOTER.EDITING,
        },
    };
};


export const asConfirm = (embed?: Embed): Embed => {
    return {
        ...embed,
        author: {
            name: FOOTER.CONFIRM,
        },
        color: nColor(COLOR.DEBUG),
    };
};


export const asSuccess = (embed?: Embed): Embed => {
    return {
        ...embed,
        author: {
            name: FOOTER.SUCCESS,
        },
        color: nColor(COLOR.SUCCESS),
    };
};


export const asFailure = (embed?: Embed): Embed => {
    return {
        ...embed,
        author: {
            name: FOOTER.FAILURE,
        },
        color: nColor(COLOR.ERROR),
    };
};
