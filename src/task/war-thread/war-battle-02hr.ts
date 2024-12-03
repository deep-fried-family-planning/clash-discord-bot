import {makeTask} from '#src/task/war-thread/common.ts';
import {E} from '#src/internal/pure/effect.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {dHdr1, dLinesS} from '#src/discord/util/markdown.ts';

export const WarBattle02hr = makeTask('WarBattle02hr', (data, war) => E.gen(function * () {
    yield * DiscordApi.createMessage(data.thread, {
        content: dLinesS(
            dHdr1(`${data.clanName} | Battle [T-02:00]`),
        ),
    });
}));
