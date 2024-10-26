import {ApplicationCommandOptionType} from '@discordjs/core/http-only';
import {OPTION_CLAN} from '#src/discord/command-pipeline/commands-options.ts';
import type {SubCommandSpec} from '#src/discord/types.ts';

export const CONFIG_SERVER_ADDCLAN = {
    name       : 'addclan',
    type       : ApplicationCommandOptionType.Subcommand,
    description: 'add your clan',
    options    : {
        ...OPTION_CLAN,
        countdown: {
            type       : ApplicationCommandOptionType.Channel,
            name       : 'countdown',
            description: 'restricted voice channel to display war time left and scores',
            required   : true,
        },
    },
} as const satisfies SubCommandSpec;
