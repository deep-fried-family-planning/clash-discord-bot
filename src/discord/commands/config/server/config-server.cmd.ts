import {ApplicationCommandOptionType} from 'discord-api-types/v10';
import {CONFIG_SERVER_ADD} from '#src/discord/commands/config/server/server-add.cmd.ts';
import type {SubGroupSpec} from '#src/discord/types.ts';

export const CONFIG_SERVER = {
    name       : 'server',
    type       : ApplicationCommandOptionType.SubcommandGroup,
    description: 'configure DeepFryer for your server',
    options    : {
        CMD_CONFIG_SERVER_ADD: CONFIG_SERVER_ADD,
        edit                 : {
            name       : 'edit',
            type       : ApplicationCommandOptionType.Subcommand,
            description: 'edit server configuration',
            options    : {},
        },
        remove: {
            name       : 'remove',
            type       : ApplicationCommandOptionType.Subcommand,
            description: 'remove your server',
            options    : {},
        },
    },
} as const satisfies SubGroupSpec;
