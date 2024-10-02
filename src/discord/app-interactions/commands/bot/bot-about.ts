import {dLines} from '#src/discord/helpers/markdown.ts';
import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import type {BOT_ABOUT} from '#src/discord/app-interactions/commands/bot/bot-about.cmd.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {LBUTTON_SUPPORT_SERVER} from '#src/discord/app-interactions/components/lbutton-support-server.ts';
import {LBUTTON_PATREON} from '#src/discord/app-interactions/components/lbutton-patreon.ts';
import {CMP} from '#src/discord/helpers/re-exports.ts';

export const botAbout = specCommand<typeof BOT_ABOUT>(async (body) => {
    return {
        embeds: [{
            color      : nColor(COLOR.INFO),
            description: dLines([
                '[WIP]',
                'Deep Fried Family Planning (DFFP)',
                '',
                'As a clan family with expertise in software engineering, cloud-native architecture, data science, graphic design, and UX, DFFP is building DeepFryer to make clan management easier. [WIP]',
            ]).join(''),
        }],
        components: [{
            type      : CMP.ActionRow,
            components: [
                LBUTTON_SUPPORT_SERVER,
                LBUTTON_PATREON,
            ],
        }],
    };
});
