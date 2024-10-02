import {ApplicationCommandOptionType} from '@discordjs/core';
import type {SubCommandSpec} from '#src/discord/types.ts';

export const CONFIG_SERVER_EDIT = {
    name       : 'edit',
    type       : ApplicationCommandOptionType.Subcommand,
    description: 'edit your server',
    options    : {
        admin_role: {
            name       : 'admin_role',
            type       : ApplicationCommandOptionType.Role,
            description: 'admin_role to edit bot server configurations',
        },
        faq_url: {
            name       : 'faq_url',
            type       : ApplicationCommandOptionType.String,
            description: 'URL to link to your Frequently Asked Questions (FAQ) website',
        },
    },
} as const satisfies SubCommandSpec;
