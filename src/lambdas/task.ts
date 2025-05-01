import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {SetInviteOnly} from '#src/clash/task/raid-thread/set-invite-only.ts';
import {SetOpen} from '#src/clash/task/raid-thread/set-open.ts';
import {WarBattle00hr} from '#src/clash/task/war-thread/war-battle-00hr.ts';
import {WarBattle12hr} from '#src/clash/task/war-thread/war-battle-12hr.ts';
import {WarBattle24Hr} from '#src/clash/task/war-thread/war-battle-24hr.ts';
import {WarPrep12hr} from '#src/clash/task/war-thread/war-prep-12hr.ts';
import {WarPrep24hr} from '#src/clash/task/war-thread/war-prep-24hr.ts';
import {DiscordApi, DiscordLayerLive} from '#src/internal/discord-old/layer/discord-api.ts';
import {logDiscordError} from '#src/internal/discord-old/layer/log-discord-error.ts';
import {CSL, E, L, pipe} from '#src/internal/pure/effect.ts';
import {mapL} from '#src/internal/pure/pure-list.ts';
import {EventRouter, EventRouterLive} from '#src/service/EventRouter.ts';
import {BaseLambdaLayer} from '#src/lambdas/util.ts';
import {LambdaHandler} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import type {SQSEvent} from 'aws-lambda';
import {Cause} from 'effect';
import {fromEntries} from 'effect/Record';
import {inspect} from 'node:util';

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

export const task = E.fn(
  function* (event: SQSEvent) {
    const isActive = yield* EventRouter.isActive('task', event);

    if (!isActive) {
      return;
    }

    const json = JSON.parse(event.Records[0].body);
    yield* CSL.debug('ScheduledTask', inspect(json, true, null));

    if (json.type === 'remind me') {
      return yield* DiscordApi.createMessage(json.channel_id, {
        content: `<@${json.user_id}> reminder - ${json.message_url}`,
      });
    }

    if (json.id in newLookup) {
      return yield* newLookup[json.id](json.data);
    }

    return yield* lookup[json.name as keyof typeof lookup](json);
  },
  E.catchAll((err) => logDiscordError([err])),
  E.catchAllCause((e) => E.gen(function* () {
    const error = Cause.prettyErrors(e);

    yield* logDiscordError([error]);
  })),
);
