import {COMMANDS} from '#src/discord/commands.ts';
import {buildCommand} from '#src/discord/types.ts';
import {pipe} from 'fp-ts/function';
import {fromCompare} from 'fp-ts/Ord';
import {OrdN} from '#src/data/pure.ts';
import type {ClanWarMember} from 'clashofclans.js';
import {dBold, dCode, dEmpL, dHdr3, dLine, dLink, dSubH, nNatT} from '#src/discord/command-util/message.ts';
import {concatL, mapIdxL, mapL, sortL} from '#src/data/pure-list.ts';
import {dTable} from '#src/discord/command-util/message-table.ts';
import {getSharedOptions} from '#src/discord/command-util/shared-options.ts';
import {fetchWarEntities} from '#src/discord/command-util/fetch-war-entities.ts';

export const warLinks = buildCommand(COMMANDS.WAR_LINK, async (body) => {
    const options = getSharedOptions(body);

    const entities = await fetchWarEntities(options);

    const opponentMembers = pipe(
        entities.currentWar[0].opponent.members,
        sortL(fromCompare<ClanWarMember>((a, b) => OrdN.compare(a.mapPosition, b.mapPosition))),
    );

    return [{
        title: '',
        desc : pipe(
            [
                dHdr3(`${entities.currentWar[0].clan.name} vs. ${entities.currentWar[0].opponent.name}`),
                dLink('click to open opponent clan in-game', entities.currentWar[0].opponent.shareLink),
                dEmpL(),
            ],
            concatL(pipe(
                [['wr', 'th', 'tag', 'name/link']],
                concatL(pipe(opponentMembers, mapIdxL((idx, m) =>
                    [nNatT(idx + options.from), nNatT(m.townHallLevel), m.tag, dCode(dBold(dLink(m.name, m.shareLink)))],
                ))),
                dTable,
                mapL(dCode),
            )),
            concatL([dSubH('click the highlighted names to open in-game')]),
            mapL(dLine),
        ),
    }];
});
