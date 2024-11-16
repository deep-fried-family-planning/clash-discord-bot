import {makeButton} from '#src/discord/ixc/make/components.ts';
import {ButtonStyle} from 'dfx/types';
import {SELECT_TIMES, SELECT_TIMEZONES} from '#src/discord/ix-constants.ts';
import {makeSingleSelectSubmit} from '#src/discord/ixc/make/single-select-submit.ts';

export const UserB = makeButton('UserButton', {
    label: 'User',
    style: ButtonStyle.SECONDARY,
});


export const UserTzSSS = makeSingleSelectSubmit('TZ', 'Timezone', {
    selectOptions: {
        placeholder: 'Change Timezone',
        options    : SELECT_TIMEZONES.map((tz) => tz.label === 'America/Chicago' ? {
            ...tz,
            default: true,
        } : tz),
    },
});


export const UserQhStartSSS = makeSingleSelectSubmit('QHS', 'Quiet Hrs (start)', {
    selectOptions: {
        placeholder: 'Quiet Hours (start)',
        options    : SELECT_TIMES.map((t) => t.label.includes('22:00') ? {
            ...t,
            default: true,
        } : t),
    },
});


export const UserQhEndSSS = makeSingleSelectSubmit('QHE', 'Quiet Hrs (start)', {
    selectOptions: {
        placeholder: 'Quiet Hours (end)',
        options    : SELECT_TIMES.map((t) => t.label.includes('07:00') ? {
            ...t,
            default: true,
        } : t),
    },
});
