import {E} from '#src/internal/pure/effect.ts';
import {makeTask} from '#src/task/war-thread/common.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';


export const WarBattle00hr = makeTask('WarBattle00hr', (data, war) => E.gen(function * () {
    yield * DiscordApi.createMessage(data.thread, {
        content: `war ended in ${war.finished.status}`,
    });
    yield * DiscordApi.modifyChannel(data.thread, {
        name    : `🗂️│${data.clanName}│${war.finished.endTime.toDateString()}│${war.finished.status}`,
        archived: true,
        locked  : true,
    });
}));


