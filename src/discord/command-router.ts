import {CACHE_BUST, cacheBust} from '#src/discord/commands/cache-bust.ts';
import {CLAN_FAM, clanfam} from '#src/discord/commands/clanfam.ts';
import {GIMME_DATA, gimmeData} from '#src/discord/commands/gimme-data.ts';
import {OMNI_BOARD, omniBoard} from '#src/discord/commands/omni-board.ts';
import {ONE_OF_US, oneofus} from '#src/discord/commands/oneofus.ts';
import {remind_me, REMINDME} from '#src/discord/commands/remind-me.ts';
import {server, SERVER} from '#src/discord/commands/server.ts';
import {smoke, SMOKE} from '#src/discord/commands/smoke.ts';
import {time, TIME} from '#src/discord/commands/time.ts';
import {user, USER} from '#src/discord/commands/user.ts';
import {WA_LINKS, waLinks} from '#src/discord/commands/wa-links.ts';
import {WA_MIRRORS, waMirrors} from '#src/discord/commands/wa-mirrors.ts';
import {WA_SCOUT, waScout} from '#src/discord/commands/wa-scout.ts';
import {DiscordApi} from '#src/internal/discord-old/layer/discord-api.ts';
import type {CommandSpec, IxDS} from '#src/internal/discord-old/types.ts';
import {type IxD, type IxDs, IXSOT} from '#src/internal/discord.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {emptyKV} from '#src/internal/pure/pure-kv.ts';
import {reduceL} from '#src/internal/pure/pure-list.ts';

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
  [REMINDME.name]  : remind_me,
} as const;

const overrideNames = <T extends {name: string; value?: unknown}>(options: T[]): Record<string, T['value']> =>
  pipe(
    options,
    reduceL(emptyKV(), (acc, op) => {
      acc[op.name] = op.value;
      return acc;
    }),
  );

const nameOptions = <T extends CommandSpec>(ix: IxD): IxDS<T> => {
  if ('options' in ix.data!) {
    const subgroup = ix.data.options.find((o) => o.type === IXSOT.SUB_COMMAND_GROUP);
    const cmd = ix.data.options.find((o) => o.type === IXSOT.SUB_COMMAND);

    if (subgroup) {
      return subgroup.options![0].options
        ? overrideNames(subgroup.options![0].options) as IxDS<T>
        : {} as IxDS<T>;
    }
    else if (cmd) {
      return cmd.options
        ? overrideNames(cmd.options) as IxDS<T>
        : {} as IxDS<T>;
    }
    else {
      return overrideNames(ix.data.options) as IxDS<T>;
    }
  }

  return {} as IxDS<T>;
};

export const commandRouter = (ix: IxD) => E.gen(function* () {
  const root = (ix.data as IxDs).name as keyof typeof IXS_LOOKUP;

  const message = yield* IXS_LOOKUP[root](ix, nameOptions(ix));

  return yield* DiscordApi.editOriginalInteractionResponse(ix.application_id, ix.token, message as never);
});
