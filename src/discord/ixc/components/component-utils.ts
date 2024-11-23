import type {bool, und} from '#src/internal/pure/types-pure.ts';
import type {Embed} from 'dfx/types';
import {FOOTER} from '#src/discord/ixc/store/types.ts';


export const embedIf = (condition: Embed | bool | und, embed?: Embed) => {
    if (condition) {
        return embed;
    }
    return undefined;
};


export const isViewer = (embed?: Embed) => embed?.footer?.text === FOOTER.VIEWING;
export const asViewer = (embed?: Embed): Embed => {
    return {
        ...embed,
        footer: {
            text: FOOTER.VIEWING,
        },
    };
};

export const isEditor = (embed?: Embed) => embed?.footer?.text === FOOTER.EDITING;
export const asEditor = (embed?: Embed): Embed => {
    return {
        ...embed,
        footer: {
            text: FOOTER.EDITING,
        },
    };
};


export const asConfirm = (embed?: Embed): Embed => {
    return {
        ...embed,
        footer: {
            text: FOOTER.CONFIRM,
        },
    };
};


export const asSuccess = (embed?: Embed): Embed => {
    return {
        ...embed,
        footer: {
            text: FOOTER.SUCCESS,
        },
    };
};


export const asFailure = (embed?: Embed): Embed => {
    return {
        ...embed,
        footer: {
            text: FOOTER.FAILURE,
        },
    };
};
