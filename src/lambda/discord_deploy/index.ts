import {makeLambda} from '@effect-aws/lambda';
import {CFG, E, L, Logger, pipe, RDT} from '#src/internal/pure/effect.ts';
import {mapEntries, toEntries} from 'effect/Record';
import {map} from 'effect/Array';
import {invokeCount, showMetric} from '#src/internal/metrics.ts';
import type {CommandSpec} from '#src/discord/types.ts';
import {REDACTED_DISCORD_APP_ID, REDACTED_DISCORD_BOT_TOKEN} from '#src/internal/constants/secrets.ts';
import {DiscordConfig, DiscordREST, DiscordRESTMemoryLive} from 'dfx';
import {NodeHttpClient} from '@effect/platform-node';
import {fromParameterStore} from '@effect-aws/ssm';
import {concatL, filterL, mapL, sortL} from '#src/internal/pure/pure-list.ts';
import {logDiscordError} from '#src/discord/layer/log-discord-error.ts';
import {IXS_SPECS} from '#src/discord/ixs/ixs.ts';
import type {CreateGlobalApplicationCommandParams} from 'dfx/types';
import {toValuesKV} from '#src/internal/pure/pure-kv.ts';
import {OrdB, fromCompare} from '#src/internal/pure/pure.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';


export const specToREST = (spec: CommandSpec) => {
    // @ts-expect-error todo bad types
    const sorter = fromCompare((a, b) => OrdB(Boolean(b.required), Boolean(a.required)));

    const options = pipe(spec.options, toValuesKV, sortL(sorter), mapL((v) =>
        'options' in v
            // @ts-expect-error todo bad types
            ? {...v, options: pipe(v.options, toValuesKV, sortL(sorter), mapL((v2) =>
                'options' in v2
                    ? {
                        ...v2,
                        // @ts-expect-error todo bad types
                        options: pipe(v2.options, toValuesKV, sortL(sorter)),
                    }
                    : v2,
            ))}
            : v,
    ));

    return {
        ...spec,
        options,
    } as unknown as CreateGlobalApplicationCommandParams;
};


const h = () => E.gen(function* () {
    yield * invokeCount(showMetric(invokeCount));


    const discord = yield * DiscordREST;
    const APP_ID = yield * CFG.redacted(REDACTED_DISCORD_APP_ID);

    const globalCommands = yield * discord.getGlobalApplicationCommands(RDT.value(APP_ID)).json;

    const commands = pipe(
        IXS_SPECS satisfies {[k in string]: CommandSpec},
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
    DiscordApi.Live,
    L.provideMerge(DiscordRESTMemoryLive),
    L.provide(DiscordConfig.layerConfig({token: CFG.redacted(REDACTED_DISCORD_BOT_TOKEN)})),
    L.provide(NodeHttpClient.layer),
    L.provide(L.setConfigProvider(fromParameterStore())),
    L.provide(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
);


export const handler = makeLambda(h, LambdaLive);
