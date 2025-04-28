import {DiscordApi} from '#src/internal/discord-old/layer/discord-api.ts';
import {dHdr1, dLinesS, dtRel} from '#src/internal/discord-old/util/markdown.ts';
import {E} from '#src/internal/pure/effect.ts';
import {makeTask} from '#src/clash/task/war-thread/common.ts';

export const WarBattle00hr = makeTask('WarBattle00hr', (data, war) => E.gen(function* () {
  yield* DiscordApi.createMessage(data.thread, {
    content: dLinesS(
      dHdr1(`${data.clanName} | Final ${dtRel(war.battle.endTime.getTime())}`),
      `Outcome: ${war.finished.status}`,
    ),
  });

  yield* DiscordApi.modifyChannel(data.thread, {
    name    : `🗂️│${data.clanName}│${war.finished.endTime.toDateString()}│${war.finished.status}`,
    archived: true,
    locked  : true,
  });
}));
