import {E} from '#src/internal/pure/effect.ts';
import {makeTask} from '#src/task/war-thread/common.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';


export const WarBattle24Hr = makeTask('WarBattle24Hr', (data) => E.gen(function * () {
    yield * DiscordApi.modifyChannel(data.thread, {
        name: `🗡│${data.clanName}`,
    });

    yield * DiscordApi.createMessage(data.thread, {
        content: 'war started',
    });
}));
