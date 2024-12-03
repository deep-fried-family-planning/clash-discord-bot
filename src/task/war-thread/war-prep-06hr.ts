import {makeTask, TEMP_ROLES} from '#src/task/war-thread/common.ts';
import {g} from '#src/internal/pure/effect.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {waLinksEmbed} from '#src/discord/commands/wa-links.ts';
import {dLinesS, dmRole} from '#src/discord/util/markdown.ts';


export const WarPrep06hr = makeTask('WarPrep06hr', (data, war) => g(function * () {
    yield * DiscordApi.createMessage(data.thread, {
        content: dLinesS(
            '[PREP][T-06:00]',
        ),
    });
}));