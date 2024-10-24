import {ApplicationCommandOptionType} from '@discordjs/core/http-only';
import {CONFIG_SERVER_ADD} from '#src/discord/app-interactions/commands/config/server/server-add.cmd.ts';
import type {SubGroupSpec} from '#src/discord/types.ts';
import {CONFIG_SERVER_EDIT} from '#src/discord/app-interactions/commands/config/server/server-edit.cmd.ts';
import {CONFIG_SERVER_ADDCLAN} from '#src/discord/app-interactions/commands/config/server/server-addclan.ts';

export const CONFIG_SERVER = {
    name       : 'server',
    type       : ApplicationCommandOptionType.SubcommandGroup,
    description: 'configure DeepFryer for your server',
    options    : {
        CONFIG_SERVER_ADD,
        CONFIG_SERVER_EDIT,
        remove: {
            name       : 'remove',
            type       : ApplicationCommandOptionType.Subcommand,
            description: 'todo',
            options    : {},
        },
        CONFIG_SERVER_ADDCLAN,
    },
} as const satisfies SubGroupSpec;
