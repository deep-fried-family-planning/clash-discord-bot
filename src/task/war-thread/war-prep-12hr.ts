import {makeTask, TEMP_ROLES} from '#src/task/war-thread/common.ts';
import {g} from '#src/internal/pure/effect.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {dHdr1, dHdr3, dLinesS, dmRole, dSpoi, dtRel} from '#src/discord/util/markdown.ts';


export const WarPrep12hr = makeTask('WarPrep12hr', (data, war) => g(function * () {
    yield * DiscordApi.createMessage(data.thread, {
        content: dLinesS(
            dHdr1(data.clanName),
            dHdr3(`Prep ends ${dtRel(war.prep.startTime.getTime())}`),
            dHdr3(dSpoi(dmRole(TEMP_ROLES.staff))),
            '* [CWL only] Reminder to review the CWL roster selection and make changes accordingly.',
            dHdr3(dSpoi(dmRole(TEMP_ROLES.warmanager))),
            '* Reminder to check army camps/spells/siege of enemy ranks #1-10',
            '* Report troop/spell comps or send screenshots.',
            '* Please notify the clan if any defensive CC is empty.',
        ),
    });
}));
