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
import {nameOptions} from '#src/discord/ixs-utils.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
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


export const ixsRouter = (ix: IxD) => E.gen(function * () {
  const root = (ix.data as IxDs).name as keyof typeof IXS_LOOKUP;

  const message = yield * IXS_LOOKUP[root](ix as never, nameOptions(ix));

  return yield * DiscordApi.editOriginalInteractionResponse(ix.application_id, ix.token, message);
});
