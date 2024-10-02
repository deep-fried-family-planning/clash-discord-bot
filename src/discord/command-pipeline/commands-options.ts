import {ApplicationCommandOptionType} from '@discordjs/core';

export const OPTION_CLAN = {
    clan: {
        type       : ApplicationCommandOptionType.String,
        name       : 'clan',
        description: 'YOUR clan tag/alias (ex. #2GR2G0PGG, main, labs) (temp: only DFFP aliases supported)',
        required   : true,
    },
} as const;

export const OPTION_EXHAUSTIVE = {
    exhaustive: {
        type       : ApplicationCommandOptionType.Boolean,
        name       : 'exhaustive',
        description: 'try player-based bypass when enemy war log is private (warning: slow)',
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
        description: 'liimt wars ingested by stats model (ex. only 50 wars) (warning: slow)',
    },
} as const;

export const OPTION_NSHOW = {
    nshow: {
        type       : ApplicationCommandOptionType.Boolean,
        name       : 'nshow',
        description: '[todo] turn off n sample size display in output',
    },
} as const;

export const OPTION_LATEST_PLAYER_INFO = {
    latest: {
        type       : ApplicationCommandOptionType.Boolean,
        name       : 'latest',
        description: '[todo] add latest player bot-info to response (ex. hero levels)',
    },
} as const;
