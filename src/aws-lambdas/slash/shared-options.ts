import {OPT} from '#src/internals/re-exports/discordjs.ts';
import type {APIApplicationCommandStringOption} from '@discordjs/core/http-only';

export const OPTION_TZ = {
    tz: {
        type       : OPT.String,
        name       : 'tz',
        description: 'timezone',
        choices    : [
            {name: 'America/New_York', value: 'America/New_York'},
            {name: 'America/Chicago', value: 'America/Chicago'},
            {name: 'America/Los_Angeles', value: 'America/Los_Angeles'},
            {name: 'Asia/Calcutta', value: 'Asia/Calcutta'},
            {name: 'Asia/Manila', value: 'Asia/Manila'},
            {name: 'Europe/London', value: 'Europe/London'},
            {name: 'Europe/Paris', value: 'Europe/Paris'},
            {name: 'Asia/Riyadh', value: 'Asia/Riyadh'},
            {name: 'Asia/Dubai', value: 'Asia/Dubai'},
            {name: 'Africa/Johannesburg', value: 'Africa/Johannesburg'},
            {name: 'Asia/Tokyo', value: 'Asia/Tokyo'},
        ],
    } as const satisfies APIApplicationCommandStringOption,
};
