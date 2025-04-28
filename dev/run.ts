import {handler as lambda_poll} from '#src/lambdas/poll.ts';
import {makeStubLambdaContext} from 'dev/ws-backend-model.ts';

await lambda_poll({}, makeStubLambdaContext());
