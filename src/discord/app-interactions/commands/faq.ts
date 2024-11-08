import {dLinesS} from '#src/discord/helpers/markdown.ts';
import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {CMP} from '#src/discord/helpers/re-exports.ts';
import {LBUTTON_FAQ} from '#src/discord/app-interactions/components/lbutton-faq.ts';
import type {FAQ} from '#src/discord/app-interactions/commands/faq.cmd.ts';

export const faq = specCommand<typeof FAQ>(async (body) => {
    return {
        embeds: [{
            color      : nColor(COLOR.INFO),
            description: dLinesS(
                'Open the link button below to find answers to frequently asked questions.',
            ),
        }],
        components: [{
            type      : CMP.ActionRow,
            components: [
                LBUTTON_FAQ(''),
            ],
        }],
    };
});
