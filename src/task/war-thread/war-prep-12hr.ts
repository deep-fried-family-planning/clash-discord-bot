import {makeTask, TEMP_ROLES} from '#src/task/war-thread/common.ts';
import {g} from '#src/internal/pure/effect.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {dHdr1, dHdr3, dLinesS, dmRole, dtRel} from '#src/discord/util/markdown.ts';
import {ourRosterEmbed, waLinksEmbed} from '#src/discord/commands/wa-links.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';


export const WarPrep12hr = makeTask('WarPrep12hr', (data, war) => g(function * () {
    yield * DiscordApi.createMessage(data.thread, {
        content: dLinesS(
            dHdr1(`${data.clanName} | Prep ends ${dtRel(war.prep.startTime.getTime())}`),

            dHdr3(dmRole(TEMP_ROLES.staff)),
            '* [CWL only] Reminder to review the CWL roster selection and make changes accordingly.',

            dHdr3(dmRole(TEMP_ROLES.warmanager)),
            '* Reminder to check army camps/spells/siege of enemy ranks #1-10',
            '* Report troop/spell comps or send screenshots.',
            '* Please notify the clan if any defensive CC is empty.',
        ),
        embeds: [
            {
                ...ourRosterEmbed(war.prep, 1),
                color: nColor(COLOR.INFO),
            },
        ],
    });
    yield * DiscordApi.createMessage(data.thread, {
        embeds: [
            {
                ...waLinksEmbed(war.prep, 1),
                color: nColor(COLOR.ERROR),
            },
        ],
    });
}));
