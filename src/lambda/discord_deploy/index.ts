import {makeLambda} from '@effect-aws/lambda';
import {CFG, E, pipe, RDT} from '#src/internal/pure/effect.ts';
import {mapEntries, toEntries} from 'effect/Record';
import {map} from 'effect/Array';
import {invokeCount, showMetric} from '#src/internal/metrics.ts';
import type {CommandSpec} from '#src/discord/types.ts';
import {REDACTED_DISCORD_APP_ID} from '#src/internal/constants/secrets.ts';
import {DiscordREST} from 'dfx';
import {concatL, filterL, mapL, sortL} from '#src/internal/pure/pure-list.ts';
import {logDiscordError} from '#src/discord/layer/log-discord-error.ts';
import {IXS_SPECS} from '#src/discord/ixs/ixs.ts';
import type {CreateGlobalApplicationCommandParams} from 'dfx/types';
import {toValuesKV} from '#src/internal/pure/pure-kv.ts';
import {OrdB} from '#src/internal/pure/pure.ts';
import {DiscordLayerLive} from '#src/discord/layer/discord-api.ts';
import {makeLambdaLayer} from '#src/internal/lambda-layer.ts';


type Sorted = {required?: boolean};
const sorter = (a: Sorted, b: Sorted) => OrdB(Boolean(b.required), Boolean(a.required));
const specToREST = (spec: CommandSpec) => ({
    ...spec,
    options: pipe(
        spec.options,
        toValuesKV,
        sortL(sorter),
        mapL((v) => 'options' in v
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
        )),
} as unknown as CreateGlobalApplicationCommandParams);


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


export const handler = makeLambda(h, makeLambdaLayer({
    apis: [
        DiscordLayerLive,
    ],
}));
