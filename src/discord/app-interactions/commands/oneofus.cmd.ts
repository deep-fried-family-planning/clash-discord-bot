import {ApplicationCommandOptionType, ApplicationCommandType} from '@discordjs/core/http-only';
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
        api_token: {
            type       : ApplicationCommandOptionType.String,
            name       : 'api_token',
            description: 'player api token from in-game settings',
            required   : true,
        },
        discord_user: {
            type       : ApplicationCommandOptionType.User,
            name       : 'discord_user',
            description: '[admin_role] discord user account to link player tag',
        },
    },
} as const satisfies CommandSpec;
