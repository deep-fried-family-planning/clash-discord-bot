import {ApplicationCommandOptionType} from 'discord-api-types/v10';

export const OPTION_CLAN = {
    clan: {
        type       : ApplicationCommandOptionType.String,
        name       : 'clan',
        description: 'tag/alias (ex. #2GR2G0PGG, main, labs...)',
        required   : true,
    },
} as const;

export const OPTION_EXHAUSTIVE = {
    exhaustive: {
        type       : ApplicationCommandOptionType.Boolean,
        name       : 'exhaustive',
        description: 'enable creative bypass when clan war log is private',
    },
} as const;

export const OPTION_FROM = {
    from: {
        type       : ApplicationCommandOptionType.Integer,
        name       : 'from',
        description: 'starting war rank (def: 1)',
    },
} as const;

export const OPTION_TO = {
    to: {
        type       : ApplicationCommandOptionType.Integer,
        name       : 'to',
        description: 'ending war rank (def: # of bases in current war)',
    },
} as const;

export const OPTION_LIMIT = {
    limit: {
        type       : ApplicationCommandOptionType.Integer,
        name       : 'limit',
        description: 'cap # of wars ingested by internal model (ex. only 50 wars per player)',
    },
} as const;

export const OPTION_NSHOW = {
    nshow: {
        type       : ApplicationCommandOptionType.Boolean,
        name       : 'nshow',
        description: 'turn off n sample size display in output',
    },
} as const;

export const OPTION_LATEST_PLAYER_INFO = {
    latest: {
        type       : ApplicationCommandOptionType.Boolean,
        name       : 'latest',
        description: 'add latest player bot-info to response (ex. hero levels)',
    },
} as const;
