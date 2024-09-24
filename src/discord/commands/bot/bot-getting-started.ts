import {dLines} from '#src/discord/command-util/message.ts';
import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import type {BOT_GETTING_STARTED} from '#src/discord/commands/bot/bot-getting-started.cmd.ts';

export const botGettingStarted = specCommand<typeof BOT_GETTING_STARTED>(async (body) => {
    return {
        embeds: [{
            description: dLines([
                '[todo]',
            ]).join(''),
        }],
    };
});
