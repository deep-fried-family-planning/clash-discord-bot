import {makeTask, TEMP_ROLES} from '#src/task/war-thread/common.ts';
import {g} from '#src/internal/pure/effect.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {waLinksEmbed} from '#src/discord/commands/wa-links.ts';
import {dLinesS, dmRole} from '#src/discord/util/markdown.ts';


export const WarPrep24hr = makeTask('WarPrep24hr', (data, war) => g(function * () {
    yield * DiscordApi.createMessage(data.thread, {
        content: dLinesS(
            dmRole(TEMP_ROLES.warmanager),
            'Please check the army camps/spells/siege of enemy ranks #1-10. Report troop/spell comps or send screenshots.',
        ),
        embeds: [waLinksEmbed(war.prep, 1)],
    });
}));
