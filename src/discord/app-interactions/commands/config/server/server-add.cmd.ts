import {ApplicationCommandOptionType} from '@discordjs/core/http-only';
import type {SubCommandSpec} from '#src/discord/types.ts';

export const CONFIG_SERVER_ADD = {
    name       : 'add',
    type       : ApplicationCommandOptionType.Subcommand,
    description: 'add your server',
    options    : {
        admin_role: {
            name       : 'admin_role',
            type       : ApplicationCommandOptionType.Role,
            description: 'admin role to further configure bot',
            required   : true,
        },
        war_room: {
            name       : 'war_room',
            type       : ApplicationCommandOptionType.Channel,
            description: 'war channel to post threads per clan',
            required   : true,
        },
    },
} as const satisfies SubCommandSpec;
