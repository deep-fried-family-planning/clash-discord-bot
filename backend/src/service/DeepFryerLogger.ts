import {COLOR, nColor} from '#src/internal/old/colors.ts';
import {AwsLambdaEnv, DiscordEnv} from 'config/external.ts';
import type {Discord} from 'dfx';
import {DiscordREST} from 'dfx/DiscordREST';
import type * as Config from 'effect/Config';
import * as E from 'effect/Effect';
import {inspect} from 'node:util';

const showString = (e: any) =>
  JSON.parse(
    JSON.stringify(e, null, 2),
  ).substring(0, 3500);

const show = (e: any) => {
  const output = inspect(e, true, null);
  return structuredClone(output);
};

const asMessage = (embed: Discord.RichEmbed) => ({
  embeds: [embed],
});

const buildCloudWatchAuthorLink = (aws: Config.Config.Success<typeof AwsLambdaEnv>) =>
  ({
    name: aws.AWS_LAMBDA_FUNCTION_NAME,
    url : `https://${aws.AWS_REGION}.console.aws.amazon.com/cloudwatch/home?`
      + `region=${aws.AWS_REGION}`
      + `#logsV2:log-groups/log-group/`
      + encodeURIComponent(aws.AWS_LAMBDA_LOG_GROUP_NAME)
      + '/log-events/'
      + encodeURIComponent(aws.AWS_LAMBDA_LOG_STREAM_NAME),
  });

export class DeepFryerLogger extends E.Service<DeepFryerLogger>()('deepfryer/Logger', {
  effect: E.gen(function* () {
    const env = yield* DiscordEnv;
    const aws = yield* AwsLambdaEnv;
    const discord = yield* DiscordREST;

    const [debugToken, debugId] = env.DFFP_DISCORD_DEBUG_URL.split('/').toReversed();
    const [errorToken, errorId] = env.DFFP_DISCORD_ERROR_URL.split('/').toReversed();

    const logDebug = (e: any) => {
      const str = show(e);
      return E.logDebug(str).pipe(E.flatMap(() =>
        discord.executeWebhook(
          debugId,
          debugToken,
          {
            params: {
              wait: true,
            },
            payload: asMessage({
              color      : nColor(COLOR.DEBUG),
              author     : buildCloudWatchAuthorLink(aws),
              description: showString(str),
            }),
          },
        ),
      ));
    };

    const logError = (e: any) => {
      const str = show(e);
      return E.logError(str).pipe(E.flatMap(() =>
        discord.executeWebhook(
          errorId,
          errorToken,
          {
            params: {
              wait: true,
            },
            payload: asMessage({
              color      : nColor(COLOR.ERROR),
              author     : buildCloudWatchAuthorLink(aws),
              description: showString(str),
            }),
          },
        ),
      ));
    };

    const logFatal = (e: any) => {
      const str = show(e);
      return E.logFatal(str).pipe(E.flatMap(() =>
        discord.executeWebhook(
          errorId,
          errorToken,
          {
            params: {
              wait: true,
            },
            payload: asMessage({
              color      : nColor(COLOR.ERROR),
              author     : buildCloudWatchAuthorLink(aws),
              description: showString(str),
            }),
          },
        ),
      ));
    };

    const logInfo = (e: any) => {
      const str = show(e);
      return E.logInfo(str).pipe(E.flatMap(() =>
        discord.executeWebhook(
          debugId,
          debugToken,
          {
            params: {
              wait: true,
            },
            payload: asMessage({
              color      : nColor(COLOR.INFO),
              author     : buildCloudWatchAuthorLink(aws),
              description: showString(str),
            }),
          },
        ),
      ));
    };

    const logWarning = (e: any) => {
      const str = show(e);
      return E.logWarning(str).pipe(E.flatMap(() =>
        discord.executeWebhook(
          debugToken,
          debugId,
          {
            params: {
              wait: true,
            },
            payload: asMessage({
              color      : nColor(COLOR.DEBUG),
              author     : buildCloudWatchAuthorLink(aws),
              description: showString(str),
            }),
          },
        ),
      ));
    };

    const logTrace = (e: any) =>
      E.logTrace(show(e));

    return {
      logDebug,
      logError,
      logFatal,
      logInfo,
      logWarning,
      logTrace,
    };
  }),
  accessors: true,
}) {}
