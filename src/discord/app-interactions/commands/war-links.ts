import type {COMMANDS} from '#src/discord/commands.ts';
import {fromCompare, OrdN} from '#src/pure/pure.ts';
import type {ClanWarMember} from 'clashofclans.js';
import {dBold, dCode, dEmpL, dHdr3, dLine, dLink, dSubH, nNatT} from '#src/discord/helpers/markdown.ts';
import {concatL, mapL, sortL} from '#src/pure/pure-list.ts';
import {dTable} from '#src/discord/command-util/message-table.ts';
import {getSharedOptions} from '#src/discord/command-util/shared-options.ts';
import {fetchWarEntities} from '#src/discord/command-util/fetch-war-entities.ts';
import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import {notFound} from '@hapi/boom';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {pipe} from '#src/utils/effect.ts';

export const warLinks = specCommand<typeof COMMANDS.WAR_LINKS>(async (body) => {
    const options = getSharedOptions(body);

    const entities = await fetchWarEntities(options);

    if (!entities.currentWar.length) {
        throw notFound('no current war found');
    }

    const opponentMembers = pipe(
        entities.currentWar[0].opponent.members,
        sortL(fromCompare<ClanWarMember>((a, b) => OrdN(a.mapPosition, b.mapPosition))),
    );

    return {
        embeds: [{
            color      : nColor(COLOR.INFO),
            description: pipe(
                [
                    dHdr3(`${entities.currentWar[0].clan.name} vs. ${entities.currentWar[0].opponent.name}`),
                    dLink('click to open opponent clan in-game', entities.currentWar[0].opponent.shareLink),
                    dEmpL(),
                ],
                concatL(pipe(
                    [['wr', 'th', 'tag', 'name/link']],
                    concatL(pipe(opponentMembers, mapL((m, idx) =>
                        [nNatT(idx + options.from), nNatT(m.townHallLevel), m.tag, dCode(dBold(dLink(m.name, m.shareLink)))],
                    ))),
                    dTable,
                    mapL(dCode),
                )),
                concatL([dSubH('click the highlighted names to open in-game')]),
                mapL(dLine),
            ).join(''),
        }],
    };
});
