import {dLines} from '#src/discord/command-util/message.ts';
import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import type {BOT_ABOUT} from '#src/discord/commands/bot/bot-about.cmd.ts';

export const botAbout = specCommand<typeof BOT_ABOUT>(async (body) => {
    return {
        embeds: [{
            description: dLines([
                '[todo]',
            ]).join(''),
        }],
    };
});
