import {CSL, E, pipe} from '#src/internal/pure/effect.ts';
import {makeLambda} from '@effect-aws/lambda';
import type {SQSEvent} from 'aws-lambda';
import {IXT, MGF} from '#src/discord/util/discord.ts';
import type {IxD} from '#src/discord/util/discord.ts';
import {mapL} from '#src/internal/pure/pure-list.ts';
import {Cause} from 'effect';
import {logDiscordError} from '#src/discord/layer/log-discord-error.ts';
import {DiscordApi, DiscordLayerLive} from '#src/discord/layer/discord-api.ts';
import {Discord} from 'dfx';
import {inspect} from 'node:util';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {ixcRouter} from '#src/discord/ixc/ixc-router.ts';
import {makeLambdaLayer} from '#src/internal/lambda-layer.ts';


const menu = (ix: IxD) => E.gen(function * () {
    yield * CSL.debug('[CompIx]:', ix);
    yield * CSL.debug('[IxData]:', inspect(ix.data, true, null));
    yield * CSL.debug('[IxMessage]:', inspect(ix.message, true, null));

    if (ix.type === IXT.MESSAGE_COMPONENT) {
        return yield * ixcRouter(ix);
    }
}).pipe(
    E.catchAllCause((error) => E.gen(function * () {
        const e = Cause.prettyErrors(error);

        const userMessage = yield * logDiscordError(e);

        yield * DiscordApi.createInteractionResponse(ix.id, ix.token, {
            type: Discord.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                ...userMessage,
                flags: MGF.EPHEMERAL,
            },
        });
    })),
);


const h = (event: SQSEvent) => pipe(
    event.Records,
    mapL((r) => {
        const json = JSON.parse(r.body) as IxD;

        return menu(json);
    }),
    E.all,
);


export const handler = makeLambda(h, makeLambdaLayer({
    apis: [
        Clashofclans.Live,
        DiscordLayerLive,
    ],
    aws: [
        DynamoDBDocument.defaultLayer,
    ],
}));
