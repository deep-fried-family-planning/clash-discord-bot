import {makeTask} from '#src/task/war-thread/common.ts';
import {g} from '#src/internal/pure/effect.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {dHdr1, dLinesS, dtRel} from '#src/discord/util/markdown.ts';

export const WarPrep02hr = makeTask('WarPrep02hr', (data, war) => g(function * () {
    yield * DiscordApi.createMessage(data.thread, {
        content: dLinesS(
            dHdr1(`${data.clanName} | Prep ${dtRel(war.battle.startTime.getTime())}`),
        ),
    });
}));
