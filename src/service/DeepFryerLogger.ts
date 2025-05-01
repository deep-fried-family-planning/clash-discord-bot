import {AwsLambdaEnv, DiscordEnv} from '#config/external.ts';
import {COLOR, nColor} from '#src/internal/discord-old/constants/colors.ts';
import {E} from '#src/internal/pure/effect.ts';
import {DiscordREST, type DiscordRESTError} from 'dfx/DiscordREST';
import type {Embed} from 'dfx/types';
import {type Config, Layer, Logger, LogLevel} from 'effect';
import {inspect} from 'node:util';

const showString = (e: any) =>
  JSON.stringify(e, null, 2).substring(0, 3500);

const show = (e: any) =>
  inspect(e, true, null);

const asMessage = (embed: Embed) => ({
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

type ExecuteWebhook = E.Effect<
  {
    id        : string;
    channel_id: string;
  },
  DiscordRESTError
>;

export class DeepFryerLogger extends E.Service<DeepFryerLogger>()('deepfryer/Logger', {
  effect: E.gen(function* () {
    const env = yield* DiscordEnv;
    const aws = yield* AwsLambdaEnv;
    const discord = yield* DiscordREST;

    const [debugToken, debugId] = env.DFFP_DISCORD_DEBUG_URL.split('/').reverse();
    const [errorToken, errorId] = env.DFFP_DISCORD_ERROR_URL.split('/').reverse();

    const logDebug = (e: any) =>
      E.logDebug(show(e)).pipe(E.flatMap(() =>
        discord.executeWebhook(
          debugId,
          debugToken,
          asMessage({
            color      : nColor(COLOR.DEBUG),
            author     : buildCloudWatchAuthorLink(aws),
            description: showString(e),
          }),
        ).json as ExecuteWebhook,
      ));

    const logError = (e: any) =>
      E.logError(show(e)).pipe(E.flatMap(() =>
        discord.executeWebhook(
          errorToken,
          errorId,
          asMessage({
            color      : nColor(COLOR.ERROR),
            author     : buildCloudWatchAuthorLink(aws),
            description: showString(e),
          }),
        ).json as ExecuteWebhook,
      ));

    const logFatal = (e: any) =>
      E.logFatal(show(e)).pipe(E.flatMap(() =>
        discord.executeWebhook(
          errorToken,
          errorId,
          asMessage({
            color      : nColor(COLOR.ERROR),
            author     : buildCloudWatchAuthorLink(aws),
            description: showString(e),
          }),
        ).json as ExecuteWebhook,
      ));

    const logInfo = (e: any) =>
      E.logInfo(show(e)).pipe(E.flatMap(() =>
        discord.executeWebhook(
          errorToken,
          errorId,
          asMessage({
            color      : nColor(COLOR.INFO),
            author     : buildCloudWatchAuthorLink(aws),
            description: showString(e),
          }),
        ).json as ExecuteWebhook,
      ));

    const logWarning = (e: any) =>
      E.logWarning(show(e)).pipe(E.flatMap(() =>
        discord.executeWebhook(
          debugId,
          debugToken,
          asMessage({
            color      : nColor(COLOR.DEBUG),
            author     : buildCloudWatchAuthorLink(aws),
            description: showString(e),
          }),
        ).json as ExecuteWebhook,
      ));

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
