import {CACHE_BUST, cacheBust} from '#src/commands/cache-bust.ts';
import {CLAN_FAM, clanfam} from '#src/commands/clanfam.ts';
import {GIMME_DATA, gimmeData} from '#src/commands/gimme-data.ts';
import {OMNI_BOARD, omniBoard} from '#src/commands/omni-board.ts';
import {ONE_OF_US, oneofus} from '#src/commands/oneofus.ts';
import {remind_me, REMIND_ME} from '#src/commands/remind-me.ts';
import {server, SERVER} from '#src/commands/server.ts';
import {smoke, SMOKE} from '#src/commands/smoke.ts';
import {time, TIME} from '#src/commands/time.ts';
import {user, USER} from '#src/commands/user.ts';
import {WA_LINKS, waLinks} from '#src/commands/wa-links.ts';
import {WA_MIRRORS, waMirrors} from '#src/commands/wa-mirrors.ts';
import {WA_SCOUT, waScout} from '#src/commands/wa-scout.ts';
import type {CommandSpec, IxDS} from '#src/internal/old/types.ts';
import {emptyKV} from '#src/internal/pure/pure-kv.ts';
import {reduceL} from '#src/internal/pure/pure-list.ts';
import type {Discord} from 'dfx';
import {DiscordREST} from 'dfx';
import {ApplicationCommandOptionType} from 'dfx/types';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

const IXS_LOOKUP = {
  [CLAN_FAM.name]  : clanfam,
  [ONE_OF_US.name] : oneofus,
  [SERVER.name]    : server,
  [SMOKE.name]     : smoke,
  [TIME.name]      : time,
  [USER.name]      : user,
  [WA_LINKS.name]  : waLinks,
  [WA_MIRRORS.name]: waMirrors,
  [WA_SCOUT.name]  : waScout,
  [CACHE_BUST.name]: cacheBust,
  [GIMME_DATA.name]: gimmeData,
  [OMNI_BOARD.name]: omniBoard,
  [REMIND_ME.name] : remind_me,
} as const;

const overrideNames = <T extends {name: string; value?: unknown}>(options: T[]): Record<string, T['value']> =>
  pipe(
    options,
    reduceL(emptyKV(), (acc, op) => {
      acc[op.name] = op.value;
      return acc;
    }),
  );

const nameOptions = <T extends CommandSpec>(ix: Discord.APIInteraction): IxDS<T> => {
  if ('options' in ix.data!) {
    const subgroup = ix.data.options.find((o) => o.type === ApplicationCommandOptionType.SUB_COMMAND_GROUP);
    const cmd = ix.data.options.find((o) => o.type === ApplicationCommandOptionType.SUB_COMMAND);

    if (subgroup) {
      return subgroup.options![0].options
        ? overrideNames(subgroup.options![0].options as any) as IxDS<T>
        : {} as IxDS<T>;
    }
    else if (cmd) {
      return cmd.options
        ? overrideNames(cmd.options as any) as IxDS<T>
        : {} as IxDS<T>;
    }
    else {
      return overrideNames(ix.data.options as any) as IxDS<T>;
    }
  }

  return {} as IxDS<T>;
};

export const commandRouter = (ix: Discord.APIInteraction) => E.gen(function* () {
  const discord = yield* DiscordREST;
  const root = (ix.data as Discord.APIBaseApplicationCommandInteractionData<any>).name as keyof typeof IXS_LOOKUP;

  const message = yield* IXS_LOOKUP[root](ix, nameOptions(ix)) as E.Effect<any>;

  yield* discord.updateOriginalWebhookMessage(ix.application_id, ix.token, {
    payload: message as never,
  });
});
