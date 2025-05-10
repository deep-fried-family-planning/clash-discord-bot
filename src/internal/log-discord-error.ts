import {COLOR, nColor} from '#src/constants/colors.ts';
import {dLinesS} from '#src/internal/markdown.ts';
import {buildCloudWatchLink} from '#src/internal/validation.ts';
import {CSL, E, pipe} from '#src/internal/pure/effect.ts';
import {mapL} from '#src/internal/pure/pure-list.ts';
import {DiscordREST} from 'dfx';
import {inspect} from 'node:util';

export const logDiscordError = (e: unknown[]) => E.gen(function* () {
  yield* CSL.error('[CAUSE]:', ...e.map((e) => inspect(e, true, null)));

  const discord = yield* DiscordREST;

  const url = process.env.DFFP_DISCORD_ERROR_URL!;

  const [token, id] = url.split('/').reverse();

  const log = yield* discord.executeWebhook(id, token, {
    embeds: [{
      color      : nColor(COLOR.ERROR),
      title      : process.env.AWS_LAMBDA_FUNCTION_NAME!,
      description: dLinesS(
        dLinesS(...pipe(e, mapL((err) => dLinesS(
          // @ts-expect-error bad types...
          err.name,
          // @ts-expect-error bad types...
          err.e,
        )))),
        '',
        process.env.AWS_LAMBDA_LOG_GROUP_NAME!,
        process.env.AWS_LAMBDA_LOG_STREAM_NAME!,
        buildCloudWatchLink(),
      ),
    }],
  }, {
    urlParams: {
      wait: true,
    },
  }).json;

  return {
    embeds: [{
      color      : nColor(COLOR.ERROR),
      title      : 'Unknown Error',
      description: dLinesS(
        `If you don't think your input caused this error, send this link to the support server:`,
        `-# <https://discord.com/channels/1283847240061947964/${log.channel_id}/${log.id}>`,
      ),
      footer: {
        text: 'Made with ❤️ by NotStr8DontH8 and DFFP.',
      },
    }],
  };
});
