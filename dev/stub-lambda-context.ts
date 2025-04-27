export const stubLambdaContext = {
  awsRequestId                  : '',
  callbackWaitsForEmptyEventLoop: false,
  clientContext                 : undefined,
  done(error: Error | undefined, result: any): void {
  },
  fail(error: string | Error): void {
  },
  functionName   : '',
  functionVersion: '',
  getRemainingTimeInMillis(): number {
    return 0;
  },
  identity          : undefined,
  invokedFunctionArn: '',
  logGroupName      : '',
  logStreamName     : '',
  memoryLimitInMB   : '',
  succeed(messageOrObject: any, object?: any): void {
  },
};
