import {ApplicationCommandType} from 'discord-api-types/v10';
import type {CommandSpec} from '#src/discord/types.ts';

export const FAQ = {
    type       : ApplicationCommandType.ChatInput,
    name       : 'faq',
    description: 'Frequently Asked Questions (FAQ) page for this server',
    options    : {},
} as const satisfies CommandSpec;
