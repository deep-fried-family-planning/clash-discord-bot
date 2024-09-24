import {ApplicationCommandOptionType, ApplicationCommandType} from 'discord-api-types/v10';
import type {CommandSpec} from '#src/discord/types.ts';

export const ONE_OF_US = {
    type       : ApplicationCommandType.ChatInput,
    name       : 'oneofus',
    description: 'link clash account to discord',
    options    : {
        player_tag: {
            type       : ApplicationCommandOptionType.String,
            name       : 'player_tag',
            description: 'tag for player in-game (ex. #2GR2G0PGG)',
            required   : true,
        },
        discord_user: {
            type       : ApplicationCommandOptionType.User,
            name       : 'discord_user',
            description: 'discord user account to link player tag',
            required   : true,
        },
    },
} as const satisfies CommandSpec;
