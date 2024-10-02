import {ApplicationCommandOptionType} from '@discordjs/core';
import type {SubCommandSpec} from '#src/discord/types.ts';

export const BOT_ABOUT = {
    type       : ApplicationCommandOptionType.Subcommand,
    name       : 'about',
    description: 'Information about DFFP and our bot DeepFryer - Support, contributing, and funding.',
    options    : {},
} as const satisfies SubCommandSpec;
