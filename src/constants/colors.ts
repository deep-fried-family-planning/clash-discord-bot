export const enum COLOR {
    SUCCESS = '#80EF80',
    INFO = '#22B5C8',
    DEBUG = '#FF8547',
    ERROR = '#FF645C',
    BOT = '#C8C4F0',
    CLASH = '#FFEB88',
    QUAL = '#A5EF80',
    ORIGINAL = '#F5F0ED',
    REDDENED_EARTH = '#9c6e63',
}

export const nColor = (c: COLOR) => Number.parseInt(c.replace('#', '0x'));
