import {CACHE_BUST} from '#src/discord/commands/cache-bust.ts';
import {CLAN_FAM} from '#src/discord/commands/clanfam.ts';
import {GIMME_DATA} from '#src/discord/commands/gimme-data.ts';
import {OMNI_BOARD} from '#src/discord/commands/omni-board.ts';
import {ONE_OF_US} from '#src/discord/commands/oneofus.ts';
import {REMINDME} from '#src/discord/commands/remind-me.ts';
import {SERVER} from '#src/discord/commands/server.ts';
import {SMOKE} from '#src/discord/commands/smoke.ts';
import {TIME} from '#src/discord/commands/time.ts';
import {USER} from '#src/discord/commands/user.ts';
import {WA_LINKS} from '#src/discord/commands/wa-links.ts';
import {WA_MIRRORS} from '#src/discord/commands/wa-mirrors.ts';
import {WA_SCOUT} from '#src/discord/commands/wa-scout.ts';
import {logDiscordError} from '#src/internal/discord-old/log-discord-error.ts';
import type {CommandSpec} from '#src/internal/discord-old/types.ts';
import {invokeCount, showMetric} from '#src/internal/metrics.ts';
import {CFG, DT, E, L, Logger, pipe, RDT} from '#src/internal/pure/effect.ts';
import {toValuesKV} from '#src/internal/pure/pure-kv.ts';
import {concatL, filterL, mapL, sortL} from '#src/internal/pure/pure-list.ts';
import {OrdB} from '#src/internal/pure/pure.ts';
import {DiscordLayer} from '#src/util/layers';
import {makeLambda} from '@effect-aws/lambda';
import {fromParameterStore} from '@effect-aws/ssm';
import type {Discord} from 'dfx';
import {DiscordREST} from 'dfx';
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
const sorter = (a: Sorted, b: Sorted) => OrdB(Boolean(b.required), Boolean(a.required));
const specToREST = (spec: CommandSpec) => ({
  ...spec,
  options: pipe(
    spec.options,
    toValuesKV,
    sortL(sorter),
    mapL((v) => 'options' in v
      ? {
        // @ts-expect-error todo bad types
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
} as unknown as Discord.ApplicationCommandCreateRequest);

const h = () => E.gen(function* () {
  yield* invokeCount(showMetric(invokeCount));
  const ENV = process.env.LAMBDA_ENV_UPPER;
  const discord = yield* DiscordREST;
  const APP_ID = yield* CFG.redacted(`/DFFP/${ENV}/DISCORD_APP_ID`);

  const globalCommands = yield* discord.listApplicationCommands(RDT.value(APP_ID));

  const commands = pipe(
    specs satisfies { [k in string]: CommandSpec },
    mapEntries((v, k) => [k, specToREST(v)]),
    toEntries,
  );

  const names = pipe(commands, map(([, cmd]) => cmd.name));

  const deletes = pipe(
    globalCommands,
    filterL((gc) => !names.includes(gc.name)),
    mapL((gc) => discord.deleteApplicationCommand(RDT.value(APP_ID), gc.id)),
  );

  const updates = pipe(
    commands,
    mapL(([, cmd]) => discord.createApplicationCommand(RDT.value(APP_ID), cmd)),
  );

  yield* pipe(
    deletes,
    concatL(updates),
    E.allWith({concurrency: 'unbounded'}),
  );
}).pipe(
  E.catchAll((e) => logDiscordError([e])),
  E.catchAllDefect((e) => logDiscordError([e])),
);

const live = pipe(
  DiscordLayer,
  L.provideMerge(L.setConfigProvider(fromParameterStore())),
  L.provideMerge(L.setTracerTiming(true)),
  L.provideMerge(L.setTracerEnabled(true)),
  L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
  L.provideMerge(DT.layerCurrentZoneLocal),
);

export const handler = makeLambda(h, live);
