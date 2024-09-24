import {ApplicationCommandOptionType} from 'discord-api-types/v10';
import type {SubCommandSpec} from '#src/discord/types.ts';

export const CONFIG_SERVER_ADD = {
    name       : 'add',
    type       : ApplicationCommandOptionType.Subcommand,
    description: 'add your server',
    options    : {},
} as const satisfies SubCommandSpec;
