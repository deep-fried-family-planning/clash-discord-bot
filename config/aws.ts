import {Config} from 'effect';

export const DynamoEnv = Config.all({
  DFFP_DDB_TABLE    : Config.string('DDB_OPERATIONS'),
  DFFP_DDB_CACHE_TTL: Config.succeed('_tag'),
  DFFP_DDB_RCUS     : Config.succeed(10),
  DFFP_DDB_WCUS     : Config.succeed(10),
});

export const LambdaProxyEnv = Config.all({
  DFFP_DDB_OPERATIONS : Config.string('DDB_OPERATIONS'),
  DFFP_APIGW_DEV_WS   : Config.string('APIGW_DEV_WS'),
  DFFP_APIGW_DEV_WS_PK: Config.succeed('dev_ws'),
  DFFP_APIGW_DEV_WS_SK: Config.succeed('now'),
});

export const LambdaRoutesEnv = Config.all({
  ix_commands  : Config.string('LAMBDA_ARN_IX_SLASH'),
  ix_components: Config.string('LAMBDA_ARN_IX_MENU'),
  poll         : Config.string('DFFP_LAMBDA_POLL'),
  task         : Config.string('DFFP_LAMBDA_TASK'),
});
