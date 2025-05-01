import {Config} from 'effect';

/**
 * @link https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html#configuration-envvars-runtime
 */
export const AwsLambdaEnv = Config.all({
  // reserved
  _HANDLER                       : Config.string('_HANDLER'),
  _X_AMZN_TRACE_ID               : Config.string('_X_AMZN_TRACE_ID'),
  AWS_DEFAULT_REGION             : Config.string('AWS_DEFAULT_REGION'),
  AWS_REGION                     : Config.string('AWS_REGION'),
  AWS_EXECUTION_ENV              : Config.string('AWS_EXECUTION_ENV'),
  AWS_LAMBDA_FUNCTION_NAME       : Config.string('AWS_LAMBDA_FUNCTION_NAME'),
  AWS_LAMBDA_FUNCTION_MEMORY_SIZE: Config.string('AWS_LAMBDA_FUNCTION_MEMORY_SIZE'),
  AWS_LAMBDA_FUNCTION_VERSION    : Config.string('AWS_LAMBDA_FUNCTION_VERSION'),
  AWS_LAMBDA_INITIALIZATION_TYPE : Config.string('AWS_LAMBDA_INITIALIZATION_TYPE'),
  AWS_LAMBDA_LOG_GROUP_NAME      : Config.string('AWS_LAMBDA_LOG_GROUP_NAME'),
  AWS_LAMBDA_LOG_STREAM_NAME     : Config.string('AWS_LAMBDA_LOG_STREAM_NAME'),
  AWS_ACCESS_KEY                 : Config.string('AWS_ACCESS_KEY'),
  AWS_ACCESS_KEY_ID              : Config.string('AWS_ACCESS_KEY_ID'),
  AWS_SECRET_ACCESS_KEY          : Config.string('AWS_SECRET_ACCESS_KEY'),
  AWS_SESSION_TOKEN              : Config.string('AWS_SESSION_TOKEN'),
  AWS_LAMBDA_RUNTIME_API         : Config.string('AWS_LAMBDA_RUNTIME_API'),
  LAMBDA_RUNTIME_DIR             : Config.string('LAMBDA_RUNTIME_DIR'),
  // unreserved
  LANG                           : Config.string('LANG'),
  PATH                           : Config.string('PATH'),
  LD_LIBRARY_PATH                : Config.string('LD_LIBRARY_PATH'),
  NODE_PATH                      : Config.string('NODE_PATH'),
  PYTHONPATH                     : Config.string('PYTHONPATH'),
  GEM_PATH                       : Config.string('GEM_PATH'),
  AWS_XRAY_CONTEXT_MISSING       : Config.string('AWS_XRAY_CONTEXT_MISSING'),
  AWS_XRAY_DAEMON_ADDRESS        : Config.string('AWS_XRAY_DAEMON_ADDRESS'),
  AWS_LAMBDA_DOTNET_PREJIT       : Config.string('AWS_LAMBDA_DOTNET_PREJIT'),
  TZ                             : Config.string('TZ'),
});

/**
 * @link https://developer.clashofclans.com/#/documentation
 */
export const ClashEnv = Config.all({
  DFFP_COC_URL      : Config.succeed('https://cocproxy.royaleapi.dev'),
  DFFP_COC_KEY      : Config.redacted('DFFP_COC_KEY'),
  DFFP_COC_CACHE_TTL: Config.duration('DFFP_COC_CACHE_TTL'),
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
  DFFP_DISCORD_BOT_TOKEN : Config.redacted('DFFP_DISCORD_BOT_TOKEN'),
  DFFP_DISCORD_PUBLIC_KEY: Config.string('DFFP_DISCORD_PUBLIC_KEY'),
  DFFP_DISCORD_ERROR_URL : Config.string('DFFP_DISCORD_ERROR_URL'),
  DFFP_DISCORD_DEBUG_URL : Config.string('DFFP_DISCORD_DEBUG_URL'),
});

export const DiscordRESTEnv = DiscordEnv.pipe(Config.map((env) =>
  ({
    token: env.DFFP_DISCORD_BOT_TOKEN,
  }),
));
