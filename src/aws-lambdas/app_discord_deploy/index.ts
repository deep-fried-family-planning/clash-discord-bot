import {specToREST} from '#src/aws-lambdas/api_discord/commands-rest.ts';
import {makeLambda} from '@effect-aws/lambda';
import {Cfg, CFG, E, L, Logger, pipe, RDT} from '#src/internals/re-exports/effect.ts';
import {mapEntries, toEntries} from 'effect/Record';
import {map} from 'effect/Array';
import {invokeCount, showMetric} from '#src/internals/metrics.ts';
import {ONE_OF_US} from '#src/aws-lambdas/slash/commands/oneofus.ts';
import {TIME} from '#src/aws-lambdas/slash/commands/time.ts';
import {SERVER} from '#src/aws-lambdas/slash/commands/server.ts';
import {CLAN_FAM} from '#src/aws-lambdas/slash/commands/clanfam.ts';
import {USER} from '#src/aws-lambdas/slash/commands/user.ts';
import type {CommandSpec} from '#src/discord/types.ts';
import {REDACTED_DISCORD_APP_ID, REDACTED_DISCORD_BOT_TOKEN} from '#src/internals/constants/secrets.ts';
import {SMOKE} from '#src/aws-lambdas/slash/commands/smoke.ts';
import {WA_LINKS} from '#src/aws-lambdas/slash/commands/wa-links.ts';
import {WA_MIRRORS} from '#src/aws-lambdas/slash/commands/wa-mirrors.ts';
import {WA_SCOUT} from '#src/aws-lambdas/slash/commands/wa-scout.ts';
import {DiscordConfig, DiscordREST, DiscordRESTLive, MemoryRateLimitStoreLive} from 'dfx';
import {ClashLive} from '#src/internals/layers/clash-service.ts';
import {DefaultDynamoDBDocumentServiceLayer} from '@effect-aws/lib-dynamodb';
import {layerWithoutAgent, makeAgentLayer} from '@effect/platform-node/NodeHttpClient';
import {fromParameterStore} from '@effect-aws/ssm';
import {concatL, filterL, mapL} from '#src/pure/pure-list.ts';

const commands = pipe(
    {
        CLAN_FAM,
        ONE_OF_US,
        SERVER,
        SMOKE,
        TIME,
        USER,
        WA_LINKS,
        WA_MIRRORS,
        WA_SCOUT,
    } as const satisfies {[k in string]: CommandSpec},
    mapEntries((v, k) => [k, specToREST(v)]),
    toEntries,
);

const names = pipe(commands, map(([, cmd]) => cmd.name));

const h = () => E.gen(function* () {
    yield * invokeCount(showMetric(invokeCount));

    const discord = yield * DiscordREST;
    const APP_ID = yield * CFG.redacted(REDACTED_DISCORD_APP_ID);

    const globalCommandsResp = yield * discord.getGlobalApplicationCommands(RDT.value(APP_ID));
    const globalCommands = yield * globalCommandsResp.json;

    const deletes = pipe(
        globalCommands,
        filterL((gc) => !names.includes(gc.name)),
        mapL((gc) => discord.deleteGlobalApplicationCommand(RDT.value(APP_ID), gc.id)),
    );

    const updates = pipe(
        commands,
        mapL(([,cmd]) => discord.createGlobalApplicationCommand(RDT.value(APP_ID), cmd)),
    );

    yield * pipe(
        deletes,
        concatL(updates),
        E.allWith({concurrency: 'unbounded'}),
    );
});

const LambdaLive = pipe(
    DiscordRESTLive,
    L.provideMerge(ClashLive),
    L.provideMerge(DefaultDynamoDBDocumentServiceLayer),
    L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
    L.provide(MemoryRateLimitStoreLive),
    L.provide(DiscordConfig.layerConfig({token: Cfg.redacted(REDACTED_DISCORD_BOT_TOKEN)})),
    L.provide(layerWithoutAgent),
    L.provide(makeAgentLayer({keepAlive: true})),
    L.provide(L.setConfigProvider(fromParameterStore())),
);

export const handler = makeLambda(h, LambdaLive);
