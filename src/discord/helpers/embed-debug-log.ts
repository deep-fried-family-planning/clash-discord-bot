import {COLOR, nColor} from '#src/constants/colors.ts';
import {dLinesS} from '#src/discord/helpers/markdown.ts';
import {buildCloudWatchLink} from '#src/utils/links.ts';
import type {DiscordMessage} from '#src/discord/types.ts';

export const eDebugLog = (lines: string[]): DiscordMessage => ({
    embeds: [{
        color      : nColor(COLOR.DEBUG),
        title      : process.env.AWS_LAMBDA_FUNCTION_NAME,
        description: dLinesS(
            ...lines,
            buildCloudWatchLink(),
        ),
    }],
});
