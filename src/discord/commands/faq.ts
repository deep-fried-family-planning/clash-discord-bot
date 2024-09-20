import {buildCommand} from '#src/discord/types.ts';
import {COMMANDS} from '#src/discord/commands.ts';
import {dLines} from '#src/discord/command-util/message.ts';

export const faq = buildCommand(COMMANDS.FAQ, async () => {
    return [{
        desc: dLines([
            'Open this link to find answers to frequently asked questions for DFFP:',
            '',
            'https://github.com/deep-fried-family-planning/clash-discord-bot-assets/wiki/FAQ',
        ]),
    }];
});
