import {specToREST} from '#src/aws-lambdas/discord_deploy/commands-rest.ts';
import {makeLambda} from '@effect-aws/lambda';
import {Cfg, CFG, E, L, Logger, pipe, RDT} from '#src/internals/re-exports/effect.ts';
import {mapEntries, toEntries} from 'effect/Record';
import {map} from 'effect/Array';
import {invokeCount, showMetric} from '#src/internals/metrics.ts';
import type {CommandSpec} from '#src/aws-lambdas/discord_menu/old/types.ts';
import {REDACTED_DISCORD_APP_ID, REDACTED_DISCORD_BOT_TOKEN} from '#src/internals/constants/secrets.ts';
import {DiscordConfig, DiscordREST, DiscordRESTMemoryLive} from 'dfx';
import {NodeHttpClient} from '@effect/platform-node';
import {fromParameterStore} from '@effect-aws/ssm';
import {concatL, filterL, mapL} from '#src/pure/pure-list.ts';
import {logDiscordError} from '#src/internals/errors/log-discord-error.ts';
import {COMMANDS} from '#src/aws-lambdas/discord_deploy/commands.ts';

const h = () => E.gen(function* () {
    yield * invokeCount(showMetric(invokeCount));

    const discord = yield * DiscordREST;
    const APP_ID = yield * CFG.redacted(REDACTED_DISCORD_APP_ID);

    const globalCommands = yield * discord.getGlobalApplicationCommands(RDT.value(APP_ID)).json;

    const commands = pipe(
        COMMANDS satisfies {[k in string]: CommandSpec},
        mapEntries((v, k) => [k, specToREST(v)]),
        toEntries,
    );

    const names = pipe(commands, map(([, cmd]) => cmd.name));

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
}).pipe(
    E.catchAll((e) => logDiscordError([e])),
    E.catchAllDefect((e) => logDiscordError([e])),
);

const LambdaLive = pipe(
    DiscordRESTMemoryLive,
    L.provide(DiscordConfig.layerConfig({token: Cfg.redacted(REDACTED_DISCORD_BOT_TOKEN)})),
    L.provide(NodeHttpClient.layer),
    L.provide(L.setConfigProvider(fromParameterStore())),
    L.provide(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
);

export const handler = makeLambda(h, LambdaLive);
