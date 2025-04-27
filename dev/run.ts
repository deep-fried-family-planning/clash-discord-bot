import {handler as lambda_poll} from '#src/poll.ts';
import {stubLambdaContext} from 'dev/stub-lambda-context.ts';

await lambda_poll({}, stubLambdaContext);
