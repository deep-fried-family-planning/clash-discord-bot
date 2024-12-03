import {makeTask, TEMP_ROLES} from '#src/task/war-thread/common.ts';
import {g} from '#src/internal/pure/effect.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {waLinksEmbed} from '#src/discord/commands/wa-links.ts';
import {dHdr1, dLinesS, dmRole, dtRel} from '#src/discord/util/markdown.ts';


export const WarPrep12hr = makeTask('WarPrep12hr', (data, war) => g(function * () {
    yield * DiscordApi.createMessage(data.thread, {
        content: dLinesS(
            dHdr1(`${data.clanName} | Prep ${dtRel(war.battle.startTime.getTime())}`),
        ),
    });
}));
