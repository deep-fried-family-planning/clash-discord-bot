import {makeLambda} from '@effect-aws/lambda';
import {CFG, E, L, pipe, RDT} from '#src/internal/pure/effect.ts';
import {mapEntries, toEntries} from 'effect/Record';
import {map} from 'effect/Array';
import {invokeCount, showMetric} from '#src/internal/metrics.ts';
import type {CommandSpec} from '#src/discord/types.ts';
import {REDACTED_DISCORD_APP_ID} from '#src/internal/constants/secrets.ts';
import {DiscordREST} from 'dfx';
import {concatL, filterL, mapL, sortL} from '#src/internal/pure/pure-list.ts';
import {logDiscordError} from '#src/discord/layer/log-discord-error.ts';
import type {CreateGlobalApplicationCommandParams} from 'dfx/types';
import {toValuesKV} from '#src/internal/pure/pure-kv.ts';
import {OrdB} from '#src/internal/pure/pure.ts';
import {DiscordLayerLive} from '#src/discord/layer/discord-api.ts';
import {makeLambdaLayer} from '#src/internal/lambda-layer.ts';
import {CLAN_FAM} from '#src/discord/commands/link/clanfam.ts';
import {ONE_OF_US} from '#src/discord/commands/link/oneofus.ts';
import {SERVER} from '#src/discord/commands/link/server.ts';
import {SMOKE} from '#src/discord/commands/util/smoke.ts';
import {TIME} from '#src/discord/commands/util/time.ts';
import {USER} from '#src/discord/commands/link/user.ts';
import {WA_LINKS} from '#src/discord/commands/war-analysis/wa-links.ts';
import {WA_MIRRORS} from '#src/discord/commands/war-analysis/wa-mirrors.ts';
import {WA_SCOUT} from '#src/discord/commands/war-analysis/wa-scout.ts';
import {CACHE_BUST} from '#src/discord/commands/util/cache-bust.ts';
import {GIMME_DATA} from '#src/discord/commands/util/gimme-data.ts';
import {OMNI_BOARD} from '#src/discord/commands/util/omni-board.ts';


const specs = {
    CLAN_FAM,
    ONE_OF_US,
    SERVER,
    SMOKE,
    TIME,
    USER,
    WA_LINKS,
    WA_MIRRORS,
    WA_SCOUT,
    CACHE_BUST,
    GIMME_DATA,
    OMNI_BOARD,
};


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
        specs satisfies {[k in string]: CommandSpec},
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
    caches: [L.empty],
    apis  : [
        DiscordLayerLive,
    ],
    aws: [L.empty],
}));
