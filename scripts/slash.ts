import {CACHE_BUST} from '#src/commands/cache-bust.ts';
import {CLAN_FAM} from '#src/commands/clanfam.ts';
import {GIMME_DATA} from '#src/commands/gimme-data.ts';
import {OMNI_BOARD} from '#src/commands/omni-board.ts';
import {ONE_OF_US} from '#src/commands/oneofus.ts';
import {REMIND_ME} from '#src/commands/remind-me.ts';
import {SERVER} from '#src/commands/server.ts';
import {SMOKE} from '#src/commands/smoke.ts';
import {TIME} from '#src/commands/time.ts';
import {USER} from '#src/commands/user.ts';
import {WA_LINKS} from '#src/commands/wa-links.ts';
import {WA_MIRRORS} from '#src/commands/wa-mirrors.ts';
import {WA_SCOUT} from '#src/commands/wa-scout.ts';
import type {CommandSpec} from '#src/discord/old/types.ts';
import {invokeCount, showMetric} from '#src/internal/metrics.ts';
import {toValuesKV} from '#src/internal/pure/pure-kv.ts';
import {concatL, filterL, mapL, sortL} from '#src/internal/pure/pure-list.ts';
import {OrdB} from '#src/internal/pure/pure.ts';
import {DiscordLayer} from '#src/util/layers';
import {makeLambda} from '@effect-aws/lambda';
import {fromParameterStore} from '@effect-aws/ssm';
import type {Discord} from 'dfx';
import {DiscordREST} from 'dfx';
import {map} from 'effect/Array';
import * as CFG from 'effect/Config';
import * as DT from 'effect/DateTime';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as L from 'effect/Layer';
import * as Logger from 'effect/Logger';
import {mapEntries, toEntries} from 'effect/Record';
import * as RDT from 'effect/Redacted';

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
  REMINDME: REMIND_ME,
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
});

const live = pipe(
  DiscordLayer,
  L.provideMerge(L.setConfigProvider(fromParameterStore())),
  L.provideMerge(L.setTracerTiming(true)),
  L.provideMerge(L.setTracerEnabled(true)),
  L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
  L.provideMerge(DT.layerCurrentZoneLocal),
);

export const handler = makeLambda(h, live);
