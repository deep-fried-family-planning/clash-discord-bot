import {makeTask} from '#src/task/war-thread/common.ts';
import {g} from '#src/internal/pure/effect.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {dLinesS} from '#src/discord/util/markdown.ts';

export const WarPrep02hr = makeTask('WarPrep02hr', (data, war) => g(function * () {
    yield * DiscordApi.createMessage(data.thread, {
        content: dLinesS(
            '[PREP][T-02:00]',
        ),
    });
}));
