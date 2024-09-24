import {ApplicationCommandOptionType} from 'discord-api-types/v10';
import type {SubCommandSpec} from '#src/discord/types.ts';

export const BOT_GETTING_STARTED = {
    type       : ApplicationCommandOptionType.Subcommand,
    name       : 'getting-started',
    description: '[todo]',
    options    : {},
} as const satisfies SubCommandSpec;
