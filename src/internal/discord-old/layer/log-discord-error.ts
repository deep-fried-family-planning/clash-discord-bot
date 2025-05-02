import {COLOR, nColor} from '#src/internal/discord-old/constants/colors.ts';
import {RK_CLOSE, RK_OPEN} from '#src/internal/discord-old/constants/route-kind.ts';
import {IXCBS, IXCT} from '#src/internal/discord-old/discord.ts';
import {dLinesS} from '#src/internal/discord-old/util/markdown.ts';
import {buildCloudWatchLink} from '#src/internal/discord-old/util/validation.ts';
import {CSL, E, pipe} from '#src/internal/pure/effect.ts';
import {mapL} from '#src/internal/pure/pure-list.ts';
import {DiscordREST, UI} from 'dfx';
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
    components: UI.grid([
      [
        {
          type : IXCT.BUTTON,
          style: IXCBS.LINK,
          label: 'Support Server',
          url  : 'https://discord.gg/KfpCtU2rwY',
        },
      ],
      [
        {
          type     : IXCT.BUTTON,
          style    : IXCBS.SUCCESS,
          label    : 'Restart',
          custom_id: `/k/${RK_OPEN}/t/INFO`,
        },
        {
          type     : IXCT.BUTTON,
          style    : IXCBS.SECONDARY,
          custom_id: `/k/${RK_CLOSE}/t/T`,
          label    : 'Close',
        },
      ],
    ]),
  };
});
