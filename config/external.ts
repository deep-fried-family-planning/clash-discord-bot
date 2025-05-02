import * as Config from 'effect/Config';
import * as Redacted from 'effect/Redacted';

/**
 * @link https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html#configuration-envvars-runtime
 */
export const AwsLambdaEnv = Config.all({
  // reserved
  _HANDLER                       : Config.string('_HANDLER').pipe(Config.withDefault('')),
  _X_AMZN_TRACE_ID               : Config.string('_X_AMZN_TRACE_ID').pipe(Config.withDefault('')),
  AWS_DEFAULT_REGION             : Config.string('AWS_DEFAULT_REGION').pipe(Config.withDefault('')),
  AWS_REGION                     : Config.string('AWS_REGION').pipe(Config.withDefault('')),
  AWS_EXECUTION_ENV              : Config.string('AWS_EXECUTION_ENV').pipe(Config.withDefault('')),
  AWS_LAMBDA_FUNCTION_NAME       : Config.string('AWS_LAMBDA_FUNCTION_NAME').pipe(Config.withDefault('')),
  AWS_LAMBDA_FUNCTION_MEMORY_SIZE: Config.string('AWS_LAMBDA_FUNCTION_MEMORY_SIZE').pipe(Config.withDefault('')),
  AWS_LAMBDA_FUNCTION_VERSION    : Config.string('AWS_LAMBDA_FUNCTION_VERSION').pipe(Config.withDefault('')),
  AWS_LAMBDA_INITIALIZATION_TYPE : Config.string('AWS_LAMBDA_INITIALIZATION_TYPE').pipe(Config.withDefault('')),
  AWS_LAMBDA_LOG_GROUP_NAME      : Config.string('AWS_LAMBDA_LOG_GROUP_NAME').pipe(Config.withDefault('')),
  AWS_LAMBDA_LOG_STREAM_NAME     : Config.string('AWS_LAMBDA_LOG_STREAM_NAME').pipe(Config.withDefault('')),
  AWS_ACCESS_KEY                 : Config.string('AWS_ACCESS_KEY').pipe(Config.withDefault('')),
  AWS_ACCESS_KEY_ID              : Config.string('AWS_ACCESS_KEY_ID').pipe(Config.withDefault('')),
  AWS_SECRET_ACCESS_KEY          : Config.string('AWS_SECRET_ACCESS_KEY').pipe(Config.withDefault('')),
  AWS_SESSION_TOKEN              : Config.string('AWS_SESSION_TOKEN').pipe(Config.withDefault('')),
  AWS_LAMBDA_RUNTIME_API         : Config.string('AWS_LAMBDA_RUNTIME_API').pipe(Config.withDefault('')),
  LAMBDA_RUNTIME_DIR             : Config.string('LAMBDA_RUNTIME_DIR').pipe(Config.withDefault('')),
  // unreserved
  LANG                           : Config.string('LANG').pipe(Config.withDefault('')),
  PATH                           : Config.string('PATH').pipe(Config.withDefault('')),
  LD_LIBRARY_PATH                : Config.string('LD_LIBRARY_PATH').pipe(Config.withDefault('')),
  NODE_PATH                      : Config.string('NODE_PATH').pipe(Config.withDefault('')),
  PYTHONPATH                     : Config.string('PYTHONPATH').pipe(Config.withDefault('')),
  GEM_PATH                       : Config.string('GEM_PATH').pipe(Config.withDefault('')),
  AWS_XRAY_CONTEXT_MISSING       : Config.string('AWS_XRAY_CONTEXT_MISSING').pipe(Config.withDefault('')),
  AWS_XRAY_DAEMON_ADDRESS        : Config.string('AWS_XRAY_DAEMON_ADDRESS').pipe(Config.withDefault('')),
  AWS_LAMBDA_DOTNET_PREJIT       : Config.string('AWS_LAMBDA_DOTNET_PREJIT').pipe(Config.withDefault('')),
  TZ                             : Config.string('TZ').pipe(Config.withDefault('')),
});

/**
 * @link https://developer.clashofclans.com/#/documentation
 */
export const ClashEnv = Config.all({
  DFFP_COC_URL: Config.succeed('https://cocproxy.royaleapi.dev'),
  DFFP_COC_KEY: Config.redacted('DFFP_COC_KEY'),
});

/**
 * @link https://api.clashk.ing/docs
 */
export const ClashKingEnv = Config.all({
  DFFP_CLASHKING_URL               : Config.succeed('https://api.clashking.xyz'),
  DFFP_CLASHKING_LIMIT_RPS         : Config.succeed(30),
  DFFP_CLASHKING_LIMIT_HISTORIC_RPS: Config.succeed(5),
});

export const DiscordEnv = Config.all({
  DFFP_DISCORD_BOT_TOKEN : Config.redacted('DFFP_DISCORD_BOT_TOKEN').pipe(Config.withDefault(Redacted.make(''))),
  DFFP_DISCORD_PUBLIC_KEY: Config.string('DFFP_DISCORD_PUBLIC_KEY').pipe(Config.withDefault('')),
  DFFP_DISCORD_ERROR_URL : Config.string('DFFP_DISCORD_ERROR_URL').pipe(Config.withDefault('')),
  DFFP_DISCORD_DEBUG_URL : Config.string('DFFP_DISCORD_DEBUG_URL').pipe(Config.withDefault('')),
});

export const DiscordRESTEnv = DiscordEnv.pipe(Config.map((env) =>
  ({
    token: env.DFFP_DISCORD_BOT_TOKEN,
  }),
));
