export const enum COLOR {
  SUCCESS           = '#80ef80',
  INFO              = '#22b5c8',
  DEBUG             = '#ff8547',
  ERROR             = '#ff645c',
  BOT               = '#c8c4f0',
  CLASH             = '#ffeb88',
  QUAL              = '#a5ef80',
  ORIGINAL          = '#f5f0ed',

  REDDENED_EARTH___ = '#9c6e63',
  REDDENED_EARTH_IN = '#a8857a',
  REDDENED_EARTH_CO = '#c3a497',
  REDDENED_EARTH_LE = '#cfb4a8',
  REDDENED_EARTH_WH = '#dbc7bd',
}

export const nColor = (c: COLOR) => Number.parseInt(c.replace('#', '0x'));
export const sColor = (c: number) => `#${c.toString(16)}`;
