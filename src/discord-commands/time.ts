import {ApplicationCommandType} from '@discordjs/core/http-only';
import type {CommandSpec} from '#src/discord/types.ts';
import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import dayjs from 'dayjs';
import daytimezone from 'dayjs/plugin/timezone';
import dayutc from 'dayjs/plugin/utc';
import {dTable} from '#src/discord/command-util/message-table.ts';
import {pipe} from '#src/utils/effect.ts';
import {dCodes, dLines} from '#src/discord/helpers/markdown.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {CMD_OP} from '#src/discord/helpers/re-exports.ts';

export const REST_TIME = {
    type       : ApplicationCommandType.ChatInput,
    name       : 'time',
    description: 'find current time in multiple timezones',
    options    : {
        hours_ahead: {
            name       : 'hours_ahead',
            description: 'number of hours ahead to offset',
            type       : CMD_OP.Integer,
            min_value  : 1,
            max_value  : 23,
        },
        minutes_ahead: {
            name       : 'minutes_ahead',
            description: 'number of minutes ahead to offset',
            type       : CMD_OP.Integer,
            min_value  : 1,
            max_value  : 59,
        },
    },
} as const satisfies CommandSpec;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const time = /* @__PURE__ */ specCommand<typeof REST_TIME>((body) => {
    dayjs.extend(dayutc);
    dayjs.extend(daytimezone);

    let utc = dayjs();

    if (body.data.options.hours_ahead?.value) {
        utc = utc.add(body.data.options.hours_ahead.value, 'h');
    }

    if (body.data.options.minutes_ahead?.value) {
        utc = utc.add(body.data.options.minutes_ahead.value, 'm');
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
                ]),
                dCodes,
                dLines,
            ).join(''),
        }],
    };
});
