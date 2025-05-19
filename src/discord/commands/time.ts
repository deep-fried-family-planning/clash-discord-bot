import {COLOR, nColor} from '#src/discord/old/colors.ts';
import {dCodes, dLines} from '#src/discord/old/markdown.ts';
import {dTable} from '#src/discord/old/message-table.ts';
import type {CommandSpec, IxDS} from '#src/discord/old/types.ts';
import dayjs from 'dayjs';
import daytimezone from 'dayjs/plugin/timezone';
import dayutc from 'dayjs/plugin/utc';
import type {Discord} from 'dfx';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

export const TIME = {
  type       : 1,
  name       : 'time',
  description: 'find current time in multiple timezones',
  options    : {
    hours_ahead: {
      name       : 'hours_ahead',
      description: 'number of hours ahead to offset',
      type       : 4,
      min_value  : 1,
      max_value  : 23,
    },
    minutes_ahead: {
      name       : 'minutes_ahead',
      description: 'number of minutes ahead to offset',
      type       : 4,
      min_value  : 1,
      max_value  : 59,
    },
  },
} as const satisfies CommandSpec;

/**
 * @desc [SLASH /time]
 */
export const time = (ix: Discord.APIInteraction, ops: IxDS<typeof TIME>) => E.gen(function* () {
  dayjs.extend(dayutc);
  dayjs.extend(daytimezone);

  let utc = dayjs();

  if (ops.hours_ahead) {
    utc = utc.add(ops.hours_ahead as number, 'h');
  }

  if (ops.minutes_ahead) {
    utc = utc.add(ops.minutes_ahead as number, 'm');
  }

  utc = utc.utc();

  return {
    embeds: [{
      color      : nColor(COLOR.ORIGINAL),
      description: pipe(
        dTable([
          ['locale', 'time'],
          ['AWS us-east-1', utc.tz('America/New_York').format('hh:mm A')],

          ['US East      ', utc.tz('America/New_York').utc(true).format('hh:mm A')],
          ['US Central   ', utc.tz('America/Chicago').utc(true).format('hh:mm A')],
          ['US West      ', utc.tz('America/Los_Angeles').utc(true).format('hh:mm A')],
          ['India        ', utc.tz('Asia/Calcutta').utc(true).format('hh:mm A')],
          ['Philippines  ', utc.tz('Asia/Manila').utc(true).format('hh:mm A')],
          ['EU UK        ', utc.tz('Europe/London').utc(true).format('hh:mm A')],
          ['EU France    ', utc.tz('Europe/Paris').utc(true).format('hh:mm A')],
          ['Middle East  ', utc.tz('Asia/Riyadh').utc(true).format('hh:mm A')],
          ['ME - UAE     ', utc.tz('Asia/Dubai').utc(true).format('hh:mm A')],
          ['South Africa ', utc.tz('Africa/Johannesburg').utc(true).format('hh:mm A')],
          ['Tokyo        ', utc.tz('Asia/Tokyo').utc(true).format('hh:mm A')],
        ]),
        dCodes,
        dLines,
      ).join(''),
    }],
  };
});
