import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {DiscordApi, DiscordLayerLive} from '#src/discord/layer/discord-api.ts';
import {logDiscordError} from '#src/discord/layer/log-discord-error.ts';
import {CSL, E, g, L, Logger, pipe} from '#src/internal/pure/effect.ts';
import {mapL} from '#src/internal/pure/pure-list.ts';
import {SetInviteOnly} from '#src/task/raid-thread/set-invite-only.ts';
import {SetOpen} from '#src/task/raid-thread/set-open.ts';
import {WarBattle00hr} from '#src/task/war-thread/war-battle-00hr.ts';
import {WarBattle12hr} from '#src/task/war-thread/war-battle-12hr.ts';
import {WarBattle24Hr} from '#src/task/war-thread/war-battle-24hr.ts';
import {WarPrep12hr} from '#src/task/war-thread/war-prep-12hr.ts';
import {WarPrep24hr} from '#src/task/war-thread/war-prep-24hr.ts';
import {ApiGatewayManagementApi} from '@effect-aws/client-api-gateway-management-api';
import {makeLambda} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import type {SQSEvent} from 'aws-lambda';
import {Cause} from 'effect';
import {fromEntries} from 'effect/Record';
import {inspect} from 'node:util';
import {wsBypass} from '../dev/ws-bypass.ts';



const newLookup = {
  [SetInviteOnly.id]: SetInviteOnly.evaluator,
  [SetOpen.id]      : SetOpen.evaluator,
};


const lookup = pipe(
  [
    WarPrep24hr,
    WarPrep12hr,
    // WarPrep06hr,
    // WarPrep02hr,

    WarBattle24Hr,
    WarBattle12hr,
    // WarBattle06hr,
    // WarBattle02hr,
    // WarBattle01hr,
    WarBattle00hr,
  ] as const,
  mapL((t) => [t.predicate, t.evaluator] as const),
  fromEntries,
);


const h = (event: SQSEvent) => g(function * () {
  if (yield * wsBypass('task', event, E.void)) {
    return;
  }

  yield * pipe(
    event.Records,
    mapL((r) => pipe(
      E.gen(function * () {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const json = JSON.parse(r.body);

        yield * CSL.debug('ScheduledTask', inspect(json, true, null));

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (json.type === 'remind me') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          yield * DiscordApi.createMessage(json.channel_id, {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            content: `<@${json.user_id}> reminder - ${json.message_url}`,
          });
        }

        if (json.id in newLookup) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          yield * newLookup[json.id](json.data);
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
});


const LambdaLive = pipe(
  DiscordLayerLive,
  L.provideMerge(ClashOfClans.Live),
  L.provideMerge(DynamoDBDocument.defaultLayer),
  L.provideMerge(ApiGatewayManagementApi.layer({
    endpoint: process.env.APIGW_DEV_WS,
  })),
  L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
);


export const handler = makeLambda(h, LambdaLive);
