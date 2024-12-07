import {CSL, E, L, Logger, pipe} from '#src/internal/pure/effect.ts';
import {makeLambda} from '@effect-aws/lambda';
import {logDiscordError} from '#src/discord/layer/log-discord-error.ts';
import type {SQSEvent} from 'aws-lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Cause} from 'effect';
import {mapL} from '#src/internal/pure/pure-list.ts';
import {WarBattle24Hr} from '#src/task/war-thread/war-battle-24hr.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {DiscordApi, DiscordLayerLive} from '#src/discord/layer/discord-api.ts';
import {WarBattle00hr} from '#src/task/war-thread/war-battle-00hr.ts';
import {fromEntries} from 'effect/Record';
import {inspect} from 'node:util';
import {WarPrep24hr} from '#src/task/war-thread/war-prep-24hr.ts';
import {WarBattle12hr} from '#src/task/war-thread/war-battle-12hr.ts';
import {WarPrep12hr} from '#src/task/war-thread/war-prep-12hr.ts';
import {WarPrep06hr} from '#src/task/war-thread/war-prep-06hr.ts';
import {WarPrep02hr} from '#src/task/war-thread/war-prep-02hr.ts';
import {WarBattle06hr} from '#src/task/war-thread/war-battle-06hr.ts';
import {WarBattle02hr} from '#src/task/war-thread/war-battle-02hr.ts';
import {WarBattle01hr} from '#src/task/war-thread/war-battle-01hr.ts';


const lookup = pipe(
    [
        WarPrep24hr,
        WarPrep12hr,
        WarPrep06hr,
        WarPrep02hr,

        WarBattle24Hr,
        WarBattle12hr,
        WarBattle06hr,
        WarBattle02hr,
        WarBattle01hr,
        WarBattle00hr,
    ] as const,
    mapL((t) => [t.predicate, t.evaluator] as const),
    fromEntries,
);


const h = (event: SQSEvent) => pipe(
    event.Records,
    mapL((r) => pipe(
        E.gen(function * () {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const json = JSON.parse(r.body);

            yield * CSL.debug('ScheduledTask', inspect(json, true, null));

            if (json.type) {
                DiscordApi.createMessage(json.channel_id, {
                    content: `<@${json.user_id}> reminder - ${json.message_url}`,
                });
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            yield * lookup[json.name as keyof typeof lookup](json);
        }),
        E.catchAll((err) => logDiscordError([err])),
        E.catchAllCause((e) => E.gen(function * () {
            const error = Cause.prettyErrors(e);

            yield * logDiscordError([error]);
        })),
    )),
    E.allWith({concurrency: 5}),
);

// reduceL(emptyKV<
//     str,
//     (task: unknown) => TaskEffect
// >(), (ts, t) => {
//     ts[t.predicate] = t.evaluator;
//     return ts;
// }),

const LambdaLive = pipe(
    DiscordLayerLive,
    L.provideMerge(DynamoDBDocument.defaultLayer),
    L.provideMerge(ClashOfClans.Live),
    L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
);


export const handler = makeLambda(h, LambdaLive);
