import type {COMMANDS} from '#src/discord/commands.ts';
import {dLines} from '#src/discord/command-util/message.ts';
import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';

export const faq = specCommand<typeof COMMANDS.FAQ>(async () => {
    return [{
        desc: dLines([
            'Open this link to find answers to frequently asked questions for DFFP:',
            '',
            'https://github.com/deep-fried-family-planning/clash-discord-bot-assets/wiki/FAQ',
        ]),
    }];
});
