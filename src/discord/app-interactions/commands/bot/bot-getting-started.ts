import {dLines} from '#src/discord/helpers/markdown.ts';
import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import type {BOT_GETTING_STARTED} from '#src/discord/app-interactions/commands/bot/bot-getting-started.cmd.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';

export const botGettingStarted = specCommand<typeof BOT_GETTING_STARTED>(async (body) => {
    return {
        embeds: [{
            color      : nColor(COLOR.INFO),
            description: dLines([
                '[todo]',
            ]).join(''),
        }],
    };
});
