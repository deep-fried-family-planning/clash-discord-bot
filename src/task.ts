import {CFG, CSL, E, L, Logger, pipe} from '#src/internal/pure/effect.ts';
import {makeLambda} from '@effect-aws/lambda';
import {logDiscordError} from '#src/discord/layer/log-discord-error.ts';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import type {SQSEvent} from 'aws-lambda';
import {REDACTED_DISCORD_BOT_TOKEN} from '#src/constants/secrets.ts';
import {NodeHttpClient} from '@effect/platform-node';
import {fromParameterStore} from '@effect-aws/ssm';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Cause} from 'effect';
import {mapL} from '#src/internal/pure/pure-list.ts';
import {taskWarBattleThread, TaskWarBattleThreadDecode} from '#src/task/war-battle-thread.ts';
import {taskWarCloseThread, TaskWarCloseThreadDecode} from '#src/task/war-close-thread.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';


const lookup = {
    TaskWarBattleThread: [TaskWarBattleThreadDecode, taskWarBattleThread],
    TaskWarCloseThread : [TaskWarCloseThreadDecode, taskWarCloseThread],
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

            yield * task(taskData as never);
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
    DiscordApi.Live,
    L.provideMerge(DiscordRESTMemoryLive),
    L.provideMerge(DynamoDBDocument.defaultLayer),
    L.provideMerge(ClashOfClans.Live),
    L.provideMerge(NodeHttpClient.layerUndici),
    L.provideMerge(DiscordConfig.layerConfig({token: CFG.redacted(REDACTED_DISCORD_BOT_TOKEN)})),
    L.provideMerge(L.setConfigProvider(fromParameterStore())),
    L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
);


export const handler = makeLambda(h, LambdaLive);
