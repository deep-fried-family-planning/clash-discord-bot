import {REDACTED_DISCORD_APP_ID, REDACTED_DISCORD_BOT_TOKEN} from '#src/constants/secrets.ts';
import {CACHE_BUST} from '#src/internal/discord-old/commands/cache-bust.ts';
import {CLAN_FAM} from '#src/internal/discord-old/commands/clanfam.ts';
import {GIMME_DATA} from '#src/internal/discord-old/commands/gimme-data.ts';
import {OMNI_BOARD} from '#src/internal/discord-old/commands/omni-board.ts';
import {ONE_OF_US} from '#src/internal/discord-old/commands/oneofus.ts';
import {REMINDME} from '#src/internal/discord-old/commands/remind-me.ts';
import {SERVER} from '#src/internal/discord-old/commands/server.ts';
import {SMOKE} from '#src/internal/discord-old/commands/smoke.ts';
import {TIME} from '#src/internal/discord-old/commands/time.ts';
import {USER} from '#src/internal/discord-old/commands/user.ts';
import {WA_LINKS} from '#src/internal/discord-old/commands/wa-links.ts';
import {WA_MIRRORS} from '#src/internal/discord-old/commands/wa-mirrors.ts';
import {WA_SCOUT} from '#src/internal/discord-old/commands/wa-scout.ts';
import {DiscordApi} from '#src/internal/discord-old/layer/discord-api.ts';
import {logDiscordError} from '#src/internal/discord-old/layer/log-discord-error.ts';
import type {CommandSpec} from '#src/internal/discord-old/types.ts';
import {invokeCount, showMetric} from '#src/internal/metrics.ts';
import {CFG, DT, E, L, Logger, pipe, RDT} from '#src/internal/pure/effect.ts';
import {toValuesKV} from '#src/internal/pure/pure-kv.ts';
import {concatL, filterL, mapL, sortL} from '#src/internal/pure/pure-list.ts';
import {OrdB} from '#src/internal/pure/pure.ts';
import {makeLambda} from '@effect-aws/lambda';
import {fromParameterStore} from '@effect-aws/ssm';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordConfig, DiscordREST, DiscordRESTMemoryLive} from 'dfx';
import type {CreateGlobalApplicationCommandParams} from 'dfx/types';
import {map} from 'effect/Array';
import {mapEntries, toEntries} from 'effect/Record';



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
  REMINDME,
} as const;


type Sorted = {required?: boolean};
const sorter     = (a: Sorted, b: Sorted) => OrdB(Boolean(b.required), Boolean(a.required));
const specToREST = (spec: CommandSpec) => ({
  ...spec,
  options: pipe(
    spec.options,
    toValuesKV,
    sortL(sorter),
    mapL((v) => 'options' in v
      // @ts-expect-error todo bad types
      ? {
        ...v, options: pipe(v.options, toValuesKV, sortL(sorter), mapL((v2) =>
          'options' in v2
            ? {
              ...v2,
              // @ts-expect-error todo bad types
              options: pipe(v2.options, toValuesKV, sortL(sorter)),
            }
            : v2,
        )),
      }
      : v,
    ),
  ),
} as unknown as CreateGlobalApplicationCommandParams);


const h = () => E.gen(function* () {
  yield * invokeCount(showMetric(invokeCount));


  const discord = yield * DiscordREST;
  const APP_ID  = yield * CFG.redacted(REDACTED_DISCORD_APP_ID);

  const globalCommands = yield * discord.getGlobalApplicationCommands(RDT.value(APP_ID)).json;

  const commands = pipe(
    specs satisfies { [k in string]: CommandSpec },
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
    mapL(([, cmd]) => discord.createGlobalApplicationCommand(RDT.value(APP_ID), cmd)),
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

const live = pipe(
  DiscordApi.Live,
  L.provideMerge(DiscordRESTMemoryLive),
  L.provide(NodeHttpClient.layerUndici),
  L.provide(DiscordConfig.layerConfig({token: CFG.redacted(REDACTED_DISCORD_BOT_TOKEN)})),
  L.provideMerge(L.setConfigProvider(fromParameterStore())),
  L.provideMerge(L.setTracerTiming(true)),
  L.provideMerge(L.setTracerEnabled(true)),
  L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
  L.provideMerge(DT.layerCurrentZoneLocal),
);

export const handler = makeLambda(h, live);

await handler({}, {} as never);
