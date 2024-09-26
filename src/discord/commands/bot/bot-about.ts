import {dLines} from '#src/discord/command-util/message.ts';
import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import type {BOT_ABOUT} from '#src/discord/commands/bot/bot-about.cmd.ts';
import {ButtonStyle, ComponentType} from 'discord-api-types/v10';

export const botAbout = specCommand<typeof BOT_ABOUT>(async (body) => {
    return {
        embeds: [{
            description: dLines([
                '[WIP]',
                'Deep Fried Family Planning (DFFP)',
                '',
                'As a clan family with expertise in software engineering, cloud-native architecture, data science, graphic design, and UX, DFFP is building DeepFryer to make clan management easier. [WIP]',
            ]).join(''),
        }],
        components: [{
            type      : ComponentType.ActionRow,
            components: [{
                label: 'Support Server',
                type : ComponentType.Button,
                style: ButtonStyle.Link,
                url  : 'https://discord.gg/KfpCtU2rwY',
            }],
        }, {
            type      : ComponentType.ActionRow,
            components: [{
                label: 'Patreon',
                type : ComponentType.Button,
                style: ButtonStyle.Link,
                url  : 'https://www.patreon.com/dffp',
            }],
        }],
    };
});
