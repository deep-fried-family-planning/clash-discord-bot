import {makeTask} from '#src/task/war-thread/common.ts';
import {E} from '#src/internal/pure/effect.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {dLinesS} from '#src/discord/util/markdown.ts';

export const WarBattle01hr = makeTask('WarBattle01hr', (data, war) => E.gen(function * () {
    yield * DiscordApi.createMessage(data.thread, {
        content: dLinesS(
            '[BATTLE][T-01:00]',
        ),
    });
}));
