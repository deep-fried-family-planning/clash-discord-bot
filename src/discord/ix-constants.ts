import type {CommandSpec} from '#src/discord/types.ts';


export const SELECT_ACCOUNT_TYPE = [
    {
        label      : 'Main',
        value      : 'main',
        description: 'Account you spend most of your time on',
    },
    {
        label      : 'Alternative (alt)',
        value      : 'alt',
        description: 'Account you spend some time on',
    },
    {
        label      : 'Donation (dono)',
        value      : 'donation',
        description: 'Specialized only for donations',
    },
    {
        label      : 'War Asset',
        value      : 'war-asset',
        description: 'Specialized only for wars',
    },
    {
        label      : 'Clan Capital',
        value      : 'clan-capital',
        description: 'Only for extra clan capital raid weekend hits',
    },
    {
        label      : 'Rushed',
        value      : 'rush',
        description: 'Rushed account without any priorities',
    },
    {
        label      : 'Strategic Rush',
        value      : 'strategic-rush',
        description: 'Rushing for fastest time to *complete* max',
    },
    {
        label      : 'Hyper Rush',
        value      : 'hyper-rush',
        description: 'Main or alt account with following specialized rush instructions',
    },
    {
        label      : 'Admin Parking',
        value      : 'admin-parking',
        description: 'Clan leader alt',
    },
];


export const SELECT_INFO_KIND = [
    {
        label: 'About',
        value: 'about',
    },
    {
        label: 'Server Guide',
        value: 'guide',
    },
    {
        label: 'Rules',
        value: 'rule',
    },
];


export const SELECT_ROSTER_TYPE = [
    {
        label      : 'CWL',
        value      : 'cwl',
        description: 'CWL roster for a specific clan',
    },
    {
        label      : 'CWL (at-large)',
        value      : 'cwl-at-large',
        description: 'CWL roster to gauge an entire server',
    },
    {
        label      : 'War',
        value      : 'war',
        description: 'War roster for a specific clan (normal matchmaking)',
    },
    {
        label      : 'War (at-large)',
        value      : 'war-at-large',
        description: 'War roster to gauge an entire server (normal matchmaking)',
    },
];


export const SELECT_TIMEZONES = [
    {
        label: 'America/New_York',
        value: 'America/New_York',
    },
    {
        label: 'America/Chicago',
        value: 'America/Chicago',
    },
    {
        label: 'America/Los_Angeles',
        value: 'America/Los_Angeles',
    },
    {
        label: 'Asia/Calcutta',
        value: 'Asia/Calcutta',
    },
    {
        label: 'Asia/Manila',
        value: 'Asia/Manila',
    },
    {
        label: 'Europe/London',
        value: 'Europe/London',
    },
    {
        label: 'Europe/Paris',
        value: 'Europe/Paris',
    },
    {
        label: 'Asia/Riyadh',
        value: 'Asia/Riyadh',
    },
    {
        label: 'Asia/Dubai',
        value: 'Asia/Dubai',
    },
    {
        label: 'Africa/Johannesburg',
        value: 'Africa/Johannesburg',
    },
    {
        label: 'Asia/Tokyo',
        value: 'Asia/Tokyo',
    },
    {
        label: 'America/Argentina/Buenos_Aires',
        value: 'America/Argentina/Buenos_Aires',
    },
    {
        label: 'America/Santiago',
        value: 'America/Santiago',
    },
    {
        label: 'Asia/Baghdad',
        value: 'Asia/Baghdad',
    },
    {
        label: 'Pacific/Honolulu',
        value: 'Pacific/Honolulu',
    },
    {
        label      : 'Asia/Gaza',
        value      : 'Asia/Gaza',
        description: 'Free Palestine',
    },
];


// export const SELECT_TIMES = Array(24).fill(0).map((_, idx) => ({
//     label: `${idx.toString().padStart(2, '0')}:00`,
//     value: `${idx.toString().padStart(2, '0')}:00`,
// } as const));


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


export const ROSTER_ROUNDS = [
    {label: 'Round 1', value: '0', default: true},
    {label: 'Round 2', value: '1', default: true},
    {label: 'Round 3', value: '2', default: true},
    {label: 'Round 4', value: '3', default: true},
    {label: 'Round 5', value: '4', default: true},
    {label: 'Round 6', value: '5', default: true},
    {label: 'Round 7', value: '6', default: true},
];


export const ROSTER_DESIGNATIONS = [{
    label  : 'Default',
    value  : 'default',
    default: true,
}, {
    label      : 'Designated 2 Star',
    value      : 'dts',
    description: '2 star higher bases as a lower TH account',
}];


export const UNAVAILABLE = 'Unavailable';


export const SELECT_POSITIONS = [
    {value: '1', label: '1'},
    {value: '2', label: '2'},
    {value: '3', label: '3'},
    {value: '4', label: '4'},
    {value: '5', label: '5'},
    {value: '6', label: '6'},
    {value: '7', label: '7'},
    {value: '8', label: '8'},
    {value: '9', label: '9'},
    {value: '10', label: '10'},
    {value: '11', label: '11'},
    {value: '12', label: '12'},
    {value: '13', label: '13'},
    {value: '14', label: '14'},
    {value: '15', label: '15'},
    {value: '16', label: '16'},
    {value: '17', label: '17'},
    {value: '18', label: '18'},
    {value: '19', label: '19'},
    {value: '20', label: '20'},
    {value: '21', label: '21'},
    {value: '22', label: '22'},
    {value: '23', label: '23'},
    {value: '24', label: '24'},
    {value: '25', label: '25'},
];
