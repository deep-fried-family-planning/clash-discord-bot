import {handler as lambda_ix_slash} from '#src/lambdas/ix_commands.ts';
import {handler as lambda_ix_menu} from '#src/lambdas/ix_components.ts';
import {handler as lambda_poll} from '#src/lambdas/poll.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
// import {handler as lambda_task} from '#src/task.ts';

export const makeStubLambdaContext = () =>
  ({
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
  });

const lookup = {
  ix_menu : lambda_ix_menu,
  ix_slash: lambda_ix_slash,
  poll    : lambda_poll,
  // task         : lambda_task,
};

export const wsBackendModel = async (kind: str, data: any) => {
  if (kind in lookup) {
    await lookup[kind as keyof typeof lookup](data, makeStubLambdaContext());
  }
};
