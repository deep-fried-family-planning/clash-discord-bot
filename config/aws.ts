import * as Config from 'effect/Config';

export const DynamoEnv = Config.all({
  DFFP_DDB_TABLE: Config.string('DDB_OPERATIONS').pipe(Config.withDefault('')),
  DFFP_DDB_RCUS : Config.succeed(10),
  DFFP_DDB_WCUS : Config.succeed(10),
});

export const LambdaProxyEnv = Config.all({
  DFFP_DDB_OPERATIONS : Config.string('DDB_OPERATIONS').pipe(Config.withDefault('')),
  DFFP_APIGW_DEV_WS   : Config.string('APIGW_DEV_WS').pipe(Config.withDefault('')),
  DFFP_APIGW_DEV_WS_PK: Config.succeed('dev_ws'),
  DFFP_APIGW_DEV_WS_SK: Config.succeed('now'),
});

export const LambdaRoutesEnv = Config.all({
  ix_commands  : Config.string('LAMBDA_ARN_IX_SLASH').pipe(Config.withDefault('')),
  ix_components: Config.string('LAMBDA_ARN_IX_MENU').pipe(Config.withDefault('')),
  poll         : Config.succeed(''),
  task         : Config.succeed(''),
});
