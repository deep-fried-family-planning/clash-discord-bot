import type {num, str} from '#src/internal/pure/types-pure.ts';

export const enum COLOR {
    SUCCESS = '#80EF80',
    INFO = '#22B5C8',
    DEBUG = '#FF8547',
    ERROR = '#FF645C',
    BOT = '#C8C4F0',
    CLASH = '#FFEB88',
    QUAL = '#A5EF80',
    ORIGINAL = '#F5F0ED',

    REDDENED_EARTH___ = '#9c6e63',
    REDDENED_EARTH_IN = '#A8857A',
    REDDENED_EARTH_CO = '#C3A497',
    REDDENED_EARTH_LE = '#CFB4A8',
    REDDENED_EARTH_WH = '#DBC7BD',
}

export const nColor = (c: COLOR) => Number.parseInt(c.replace('#', '0x'));
export const nAnyColor = (c: str) => Number.parseInt(c.replace('#', '0x'));

export const sColor = (c: num) => {
    return `#${c.toString(16)}`;
};
