import {CFG, CSL, E, L, Logger, pipe} from '#src/internals/re-exports/effect';
import {makeLambda} from '@effect-aws/lambda';
import {logDiscordError} from '#src/internals/errors/log-discord-error.ts';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import type {SQSEvent} from 'aws-lambda';
import {REDACTED_DISCORD_BOT_TOKEN} from '#src/internals/constants/secrets.ts';
import {NodeHttpClient} from '@effect/platform-node';
import {fromParameterStore} from '@effect-aws/ssm';
import {DynamoDBDocumentService} from '@effect-aws/lib-dynamodb';
import {Cause} from 'effect';
import {mapL} from '#src/pure/pure-list.ts';
import {taskWarBattleThread, TaskWarBattleThreadDecode} from '#src/aws-lambdas/scheduled_task/tasks/war-battle-thread.ts';
import {taskWarCloseThread, TaskWarCloseThreadDecode} from '#src/aws-lambdas/scheduled_task/tasks/war-close-thread.ts';
import {Clashofclans} from '#src/internals/layer-api/clashofclans.ts';

const lookup = {
    WarBattleThread: [TaskWarBattleThreadDecode, taskWarBattleThread],
    WarCloseThread : [TaskWarCloseThreadDecode, taskWarCloseThread],
} as const;

const h = (event: SQSEvent) => pipe(
    event.Records,
    mapL((r) => pipe(
        E.gen(function * () {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const json = JSON.parse(r.body);

            yield * CSL.debug('ScheduledTask', json);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const [decode, task] = lookup[json.task as keyof typeof lookup];

            const taskData = yield * decode(json);

            yield * task(taskData);
        }),
        E.catchAll((err) => logDiscordError([err])),
        E.catchAllCause((e) => E.gen(function * () {
            const error = Cause.prettyErrors(e);

            yield * logDiscordError([error]);
        })),
    )),
    E.allWith({concurrency: 5}),
);

const LambdaLive = pipe(
    DiscordRESTMemoryLive,
    L.provideMerge(DynamoDBDocumentService.defaultLayer),
    L.provideMerge(Clashofclans.Live),
    L.provide(NodeHttpClient.layerUndici),
    L.provide(DiscordConfig.layerConfig({token: CFG.redacted(REDACTED_DISCORD_BOT_TOKEN)})),
    L.provide(L.setConfigProvider(fromParameterStore())),
    L.provide(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
);

export const handler = makeLambda(h, LambdaLive);
