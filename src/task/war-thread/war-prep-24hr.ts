import {makeTask, TEMP_ROLES} from '#src/task/war-thread/common.ts';
import {g} from '#src/internal/pure/effect.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {waLinksEmbed} from '#src/discord/commands/wa-links.ts';
import {dHdr1, dLinesS, dmRole, dtRel} from '#src/discord/util/markdown.ts';


export const WarPrep24hr = makeTask('WarPrep24hr', (data, war) => g(function * () {
    yield * DiscordApi.createMessage(data.thread, {
        content: dLinesS(
            dHdr1(`${data.clanName} | Prep ${dtRel(war.battle.startTime.getTime())}`),
            dmRole(TEMP_ROLES.warmanager),
            'Please check the army camps/spells/siege of enemy ranks #1-10. Report troop/spell comps or send screenshots.',
            '',
            dmRole(TEMP_ROLES.staff),
            'Please review the CWL roster selection and make changes accordingly.',
        ),
        embeds: [waLinksEmbed(war.prep, 1)],
    });
}));
