import {CMDOPT} from '#src/internals/re-exports/discordjs.ts';
import type {CommandSpec, Interaction} from '#src/aws-lambdas/discord_menu/old/types.ts';
import type {CmdOps} from '#src/aws-lambdas/discord_slash/types.ts';
import {pipe} from '#src/internals/re-exports/effect.ts';
import {reduceL} from '#src/pure/pure-list.ts';
import {emptyKV} from '#src/pure/pure-kv.ts';

export const OPTION_TZ = {
    tz: {
        type       : CMDOPT.String,
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
    },
} as const satisfies CommandSpec['options'];

export const OPTION_CLAN = {
    clan: {
        type       : CMDOPT.String,
        name       : 'clan',
        description: 'YOUR clan tag/alias (ex. #2GR2G0PGG, main, labs) (temp: only DFFP aliases supported)',
        required   : true,
    },
} as const satisfies CommandSpec['options'];

export const OPTION_EXHAUSTIVE = {
    exhaustive: {
        type       : CMDOPT.Boolean,
        name       : 'exhaustive',
        description: 'try player-based bypass when enemy war log is private (warning: slow)',
    },
} as const satisfies CommandSpec['options'];

export const OPTION_FROM = {
    from: {
        type       : CMDOPT.Integer,
        name       : 'from',
        description: 'starting war rank (def: 1)',
    },
} as const satisfies CommandSpec['options'];

export const OPTION_TO = {
    to: {
        type       : CMDOPT.Integer,
        name       : 'to',
        description: 'ending war rank (def: # of bases in current war)',
    },
} as const satisfies CommandSpec['options'];

export const OPTION_LIMIT = {
    limit: {
        type       : CMDOPT.Integer,
        name       : 'limit',
        description: 'limit wars ingested by stats model (ex. only 50 wars) (warning: slow)',
    },
} as const satisfies CommandSpec['options'];

export const nameOptions
    = <T extends CommandSpec>(data: Interaction): CmdOps<T> => {
        if ('options' in data.data) {
            const subgroup = data.data.options.find((o) => o.type === CMDOPT.SubcommandGroup);
            const cmd = data.data.options.find((o) => o.type === CMDOPT.Subcommand);

            if (subgroup) {
                return subgroup.options[0].options
                    ? overrideNames(subgroup.options[0].options) as CmdOps<T>
                    : {} as CmdOps<T>;
            }
            else if (cmd) {
                return cmd.options
                    ? overrideNames(cmd.options) as CmdOps<T>
                    : {} as CmdOps<T>;
            }
            else {
                return overrideNames(data.data.options) as CmdOps<T>;
            }
        }

        return {} as CmdOps<T>;
    };

const overrideNames
    = <
        T extends {name: string; value?: unknown},
    >
    (options: T[]): Record<string, T['value']> =>
        pipe(options, reduceL(emptyKV(), (acc, op) => {
            acc[op.name] = op.value;
            return acc;
        }));
