import {SELECT_TIMES, SELECT_TIMEZONES} from '#src/discord/ix-constants.ts';
import {UI} from 'dfx';
import {E} from '#src/internal/pure/effect.ts';
import {ButtonStyle} from 'dfx/types';
import {makeMenu} from '#src/discord/ixc/ixc-make.ts';

export const ManageUser = makeMenu('ManageUser', UI.button, {
    label: 'User',
    style: ButtonStyle.SECONDARY,
},
(ix, data) => E.gen(function * () {
    return {
        embeds: [{
            description: JSON.stringify(data, null, 2),
        }],
        components: UI.grid([
            [EditTimezone.built],
            [EditQuietStart.built],
            [EditQuietEnd.built],
        ]),
    };
}));


export const EditTimezone = makeMenu('EditTimezone', UI.select, {
    placeholder: 'Edit Timezone',
    options    : SELECT_TIMEZONES,
},
(ix, data) => E.gen(function * () {
    return undefined;
}));

export const EditQuietStart = makeMenu('EditQuietStart', UI.select, {
    placeholder: 'Edit Quiet Hours (start)',
    options    : SELECT_TIMES,
},
(ix, data) => E.gen(function * () {
    return undefined;
}));

export const EditQuietEnd = makeMenu('EditQuietEnd', UI.select, {
    placeholder: 'Edit Quiet Hours (end)',
    options    : SELECT_TIMEZONES,
},
(ix, data) => E.gen(function * () {
    return undefined;
}));
