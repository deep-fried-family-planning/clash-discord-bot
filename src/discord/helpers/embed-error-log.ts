import {COLOR, nColor} from '#src/constants/colors.ts';
import {dLinesS} from '#src/discord/helpers/markdown.ts';
import type {DiscordMsg} from '#src/discord/types.ts';
import {CMP} from '#src/discord/helpers/re-exports.ts';
import {LBUTTON_CLOUDWATCH} from '#src/discord/app-interactions/components/lbutton-cloudwatch.ts';
import {buildCloudWatchLink} from '#src/utils/links.ts';

export const eErrorLog = (e: Error): DiscordMsg => ({
    embeds: [{
        color      : nColor(COLOR.ERROR),
        title      : process.env.AWS_LAMBDA_FUNCTION_NAME,
        description: dLinesS(
            e.name,
            e.message,
            '',
            process.env.AWS_LAMBDA_LOG_GROUP_NAME,
            process.env.AWS_LAMBDA_LOG_STREAM_NAME,

            buildCloudWatchLink(),
        ),
    }],
    components: [{
        type      : CMP.ActionRow,
        components: [
            LBUTTON_CLOUDWATCH(),
        ],
    }],
});
