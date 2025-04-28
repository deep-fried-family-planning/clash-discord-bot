import {DiscordApi} from '#src/internal/discord-old/layer/discord-api.ts';
import {dBold, dHdr1, dHdr2, dHdr3, dLinesS, dmUser, dSpoi, dSubH, dtRel} from '#src/internal/discord-old/util/markdown.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {mapL, sortL} from '#src/internal/pure/pure-list.ts';
import {fromCompare, OrdN} from '#src/internal/pure/pure.ts';
import {makeTask} from '#src/clash/task/war-thread/common.ts';
import type {ClanWarMember} from 'clashofclans.js';
import {join} from 'effect/Array';

export const WarBattle24Hr = makeTask('WarBattle24Hr', (data, war) => E.gen(function* () {
  yield* DiscordApi.modifyChannel(data.thread, {
    name: `🗡│${data.clanName}`,
  });

  yield* DiscordApi.createMessage(data.thread, {
    content: dLinesS(
      dHdr1(data.clanName),
      dHdr3(`Battle ends ${dtRel(war.battle.endTime.getTime())}`),
      dSubH(`pings: ${pipe(
        war.battle.clan.members,
        sortL(fromCompare<ClanWarMember>((a, b) => OrdN(a.mapPosition, b.mapPosition))),
        mapL((m) => `${dmUser(data.links[m.tag])} (${m.name})`),
        join(' '),
        dSpoi,
      )}`),
      dHdr2('Reminders'),
      '1. Always use hero/power potions if not max',
      '2. ALWAYS bring a poison spell',
      `3. ${dBold('[CWL] WAIT to attack until base call strategy is ready for this war.')}`,
      `4. ${dBold('[CWL] Check thread pinned messages for most updated base calls.')}`,
    ),
  });
}));
