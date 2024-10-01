import {COLOR, nColor} from '#src/constants/colors.ts';
import {dLinesS} from '#src/discord/helpers/markdown.ts';
import {buildCloudWatchLink} from '#src/utils/links.ts';
import type {Boom} from '@hapi/boom';
import type {DiscordMessage} from '#src/discord/types.ts';

export const eErrorLog = (e: Error | Boom): DiscordMessage => ({
    embeds: [{
        color      : nColor(COLOR.ERROR),
        title      : process.env.AWS_LAMBDA_FUNCTION_NAME,
        description: dLinesS(
            e.name,
            e.message,
            '',
            process.env.AWS_LAMBDA_LOG_GROUP_NAME,
            process.env.AWS_LAMBDA_LOG_STREAM_NAME,
            '',
            buildCloudWatchLink(),
        ),
    }],
});
