import {makeTask} from '#src/task/war-thread/common.ts';
import {g} from '#src/internal/pure/effect.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';


export const WarPrep24hr = makeTask('WarPrep24hr', (data, war) => g(function * () {
    yield * DiscordApi.createMessage(data.thread, {
        content: '',
        embeds : [],
    });
}));
