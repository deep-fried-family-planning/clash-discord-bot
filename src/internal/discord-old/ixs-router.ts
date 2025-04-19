import {CACHE_BUST, cacheBust} from '#src/internal/discord-old/commands/cache-bust.ts';
import {CLAN_FAM, clanfam} from '#src/internal/discord-old/commands/clanfam.ts';
import {GIMME_DATA, gimmeData} from '#src/internal/discord-old/commands/gimme-data.ts';
import {OMNI_BOARD, omniBoard} from '#src/internal/discord-old/commands/omni-board.ts';
import {ONE_OF_US, oneofus} from '#src/internal/discord-old/commands/oneofus.ts';
import {remind_me, REMINDME} from '#src/internal/discord-old/commands/remind-me.ts';
import {server, SERVER} from '#src/internal/discord-old/commands/server.ts';
import {smoke, SMOKE} from '#src/internal/discord-old/commands/smoke.ts';
import {time, TIME} from '#src/internal/discord-old/commands/time.ts';
import {user, USER} from '#src/internal/discord-old/commands/user.ts';
import {WA_LINKS, waLinks} from '#src/internal/discord-old/commands/wa-links.ts';
import {WA_MIRRORS, waMirrors} from '#src/internal/discord-old/commands/wa-mirrors.ts';
import {WA_SCOUT, waScout} from '#src/internal/discord-old/commands/wa-scout.ts';
import {nameOptions} from '#src/internal/discord-old/ixs-utils.ts';
import {DiscordApi} from '#src/internal/discord-old/layer/discord-api.ts';
import type {IxD, IxDs} from '#src/internal/discord.ts';
import {E} from '#src/internal/pure/effect.ts';



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


export const ixsRouter = (ix: IxD) => E.gen(function* () {
  const root = (ix.data as IxDs).name as keyof typeof IXS_LOOKUP;

  const message = yield * IXS_LOOKUP[root](ix, nameOptions(ix));

  return yield * DiscordApi.editOriginalInteractionResponse(ix.application_id, ix.token, message as never);
});
