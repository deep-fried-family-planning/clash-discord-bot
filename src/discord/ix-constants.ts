import type {CommandSpec} from '#src/discord/types.ts';


export const SELECT_ACCOUNT_TYPE = [
    {label: 'main', value: 'main'},
    {label: 'alt', value: 'alt'},
    {label: 'donation', value: 'donation'},
    {label: 'war asset', value: 'war-asset'},
    {label: 'clan capital', value: 'clan-capital'},
    {label: 'strategic rush', value: 'strategic-rush'},
    {label: 'hyper rush', value: 'hyper-rush'},
    {label: 'admin parking', value: 'admin-parking'},
];


export const SELECT_TIMEZONES = [
    {label: 'America/New_York', value: 'America/New_York'},
    {label: 'America/Chicago', value: 'America/Chicago'},
    {label: 'America/Los_Angeles', value: 'America/Los_Angeles'},
    {label: 'Asia/Calcutta', value: 'Asia/Calcutta'},
    {label: 'Asia/Manila', value: 'Asia/Manila'},
    {label: 'Europe/London', value: 'Europe/London'},
    {label: 'Europe/Paris', value: 'Europe/Paris'},
    {label: 'Asia/Riyadh', value: 'Asia/Riyadh'},
    {label: 'Asia/Dubai', value: 'Asia/Dubai'},
    {label: 'Africa/Johannesburg', value: 'Africa/Johannesburg'},
    {label: 'Asia/Tokyo', value: 'Asia/Tokyo'},
];


export const SELECT_TIMES = Array(24).fill(0).map((_, idx) => ({
    label: `${idx.toString().padStart(2, '0')}:00`,
    value: `${idx.toString().padStart(2, '0')}:00`,
} as const));


export const OPTION_TZ = {
    tz: {
        type       : 3,
        name       : 'tz',
        description: 'timezone',
        choices    : SELECT_TIMEZONES.map((tz) => ({
            name : tz.label,
            value: tz.value,
        })),
    },
} as const satisfies CommandSpec['options'];


export const OPTION_CLAN = {
    clan: {
        type       : 3,
        name       : 'clan',
        description: 'YOUR clan tag/alias (ex. #2GR2G0PGG, main, labs) (temp: only DFFP aliases supported)',
        required   : true,
    },
} as const satisfies CommandSpec['options'];


export const OPTION_EXHAUSTIVE = {
    exhaustive: {
        type       : 5,
        name       : 'exhaustive',
        description: 'try player-based bypass when enemy war log is private (warning: slow)',
    },
} as const satisfies CommandSpec['options'];


export const OPTION_FROM = {
    from: {
        type       : 4,
        name       : 'from',
        description: 'starting war rank (def: 1)',
    },
} as const satisfies CommandSpec['options'];


export const OPTION_TO = {
    to: {
        type       : 4,
        name       : 'to',
        description: 'ending war rank (def: # of bases in current war)',
    },
} as const satisfies CommandSpec['options'];


export const OPTION_LIMIT = {
    limit: {
        type       : 4,
        name       : 'limit',
        description: 'limit wars ingested by stats model (ex. only 50 wars) (warning: slow)',
    },
} as const satisfies CommandSpec['options'];
