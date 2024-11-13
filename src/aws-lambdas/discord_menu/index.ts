import {CFG, Cfg, CSL, E, L, Logger, pipe} from '#src/internals/re-exports/effect.ts';
import {makeLambda} from '@effect-aws/lambda';
import {fromParameterStore} from '@effect-aws/ssm';
import type {SQSEvent} from 'aws-lambda';
import {IXT, type ModIx} from '#src/internals/re-exports/discordjs.ts';
import type {CompIx} from '#src/internals/re-exports/discordjs.ts';
import {mapL} from '#src/pure/pure-list.ts';
import {Cause, Redacted} from 'effect';
import {logDiscordError} from '#src/internals/errors/log-discord-error.ts';
import {DiscordApi} from '#src/internals/layer-api/discord-api.ts';
import {REDACTED_DISCORD_APP_ID} from '#src/internals/constants/secrets.ts';
import {ITR, MSG} from '#src/aws-lambdas/discord_menu/old/re-exports.ts';
import {Discord, DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import {NodeHttpClient} from '@effect/platform-node';
import {MENUS} from '#src/aws-lambdas/discord_menu/menus.ts';
import {inspect} from 'node:util';
import {Clashofclans} from '#src/internals/layer-api/clashofclans.ts';
import {DynamoDBDocumentService} from '@effect-aws/lib-dynamodb';

const dAppId = Cfg.redacted(REDACTED_DISCORD_APP_ID).pipe(E.map(Redacted.value));

const menu = (ix: CompIx | ModIx) => E.gen(function * () {
    yield * CSL.debug('[CompIx]:', ix);
    yield * CSL.debug('[IxData]:', inspect(ix.data, true, null));
    yield * CSL.debug('[IxMessage]:', inspect(ix.message, true, null));

    if (ix.type === IXT.MessageComponent) {
        const maybeMenu = MENUS.find((menu) => menu.is(ix.data.custom_id));

        if (!maybeMenu) {
            return;
        }

        return yield * maybeMenu.do(ix, ix.data as never);
    }
}).pipe(
    E.catchAllCause((error) => E.gen(function * () {
        const e = Cause.prettyErrors(error);

        const userMessage = yield * logDiscordError(e);

        yield * DiscordApi.createInteractionResponse(ix.id, ix.token, {
            type: Discord.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                ...userMessage,
                flags: MSG.Ephemeral,
            },
        });
    })),
);

const h = (event: SQSEvent) => pipe(
    event.Records,
    mapL((r) => {
        const json = JSON.parse(r.body) as CompIx;

        return menu(json);
    }),
    E.all,
);

const LambdaLive = pipe(
    DiscordApi.Live,
    L.provideMerge(Clashofclans.Live),
    L.provideMerge(DynamoDBDocumentService.defaultLayer),
    L.provideMerge(DiscordRESTMemoryLive),
    L.provide(DiscordConfig.layerConfig({token: CFG.redacted(REDACTED_DISCORD_APP_ID)})),
    L.provide(NodeHttpClient.layerUndici),
    L.provide(L.setConfigProvider(fromParameterStore())),
    L.provide(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
);

export const handler = makeLambda(h, LambdaLive);
