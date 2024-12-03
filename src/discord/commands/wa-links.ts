import {fetchWarEntities} from '#src/internal/graph/fetch-war-entities.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {concatL, mapL, sortL} from '#src/internal/pure/pure-list.ts';
import {fromCompare, OrdN} from '#src/internal/pure/pure.ts';
import type {ClanWar, ClanWarMember} from 'clashofclans.js';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {dBold, dCode, dEmpL, dHdr3, dLine, dLink, dSubH, nNatT} from '#src/discord/util/markdown.ts';
import {dTable} from '#src/discord/util/message-table.ts';
import type {CommandSpec, IxDS} from '#src/discord/types.ts';
import {getAliasTag} from '#src/clash/get-alias-tag.ts';
import type {IxD} from '#src/internal/discord.ts';
import {OPTION_CLAN, OPTION_FROM, OPTION_TO} from '#src/constants/ix-constants.ts';
import {validateServer} from '#src/discord/util/validation.ts';
import type {num} from '#src/internal/pure/types-pure.ts';


export const WA_LINKS = {
    type       : 1,
    name       : 'wa-links',
    description: 'get player profile links to rapidly scout enemy war camps',
    options    : {
        ...OPTION_CLAN,
        ...OPTION_FROM,
        ...OPTION_TO,
    },
} as const satisfies CommandSpec;


export const waLinks = (ix: IxD, ops: IxDS<typeof WA_LINKS>) => E.gen(function * () {
    yield * validateServer(ix);

    const clan = getAliasTag(ops.clan);

    const options = {
        cid1       : clan,
        from       : ops.from ?? 1,
        to         : ops.to ?? 50,
        showCurrent: false,
        showN      : false,
        exhaustive : false,
        limit      : 50,
    };

    const entities = yield * fetchWarEntities(options);


    return {
        embeds: [waLinksEmbed(entities.currentWar[0], options.from)],
    };
});


export const waLinksEmbed = (war: ClanWar, from: num) => {
    const opponentMembers = pipe(
        war.opponent.members,
        sortL(fromCompare<ClanWarMember>((a, b) => OrdN(a.mapPosition, b.mapPosition))),
    );

    return {
        color      : nColor(COLOR.INFO),
        description: pipe(
            [
                dHdr3(`Current Enemy War Roster: ${war.opponent.name}`),
                dLink('click to open opponent clan in-game', war.opponent.shareLink),
                dEmpL(),
            ],
            concatL(pipe(
                [['wr', 'th', 'tag', 'name/link']],
                concatL(pipe(opponentMembers, mapL((m, idx) =>
                    [nNatT(idx + from), nNatT(m.townHallLevel), m.tag, dCode(dBold(dLink(m.name, m.shareLink)))],
                ))),
                dTable,
                mapL(dCode),
            )),
            concatL([dSubH('click the highlighted names to open in-game')]),
            mapL(dLine),
        ).join(''),
    };
};


export const ourRosterEmbed = (war: ClanWar, from: num) => {
    const opponentMembers = pipe(
        war.clan.members,
        sortL(fromCompare<ClanWarMember>((a, b) => OrdN(a.mapPosition, b.mapPosition))),
    );

    return {
        color      : nColor(COLOR.INFO),
        description: pipe(
            [
                dHdr3(`Our Current War Roster: ${war.clan.name}`),
                dLink('click to open our clan in-game', war.opponent.shareLink),
                dEmpL(),
            ],
            concatL(pipe(
                [['wr', 'th', 'tag', 'name/link']],
                concatL(pipe(opponentMembers, mapL((m, idx) =>
                    [nNatT(idx + from), nNatT(m.townHallLevel), m.tag, dCode(dBold(dLink(m.name, m.shareLink)))],
                ))),
                dTable,
                mapL(dCode),
            )),
            concatL([dSubH('click the highlighted names to open in-game')]),
            mapL(dLine),
        ).join(''),
    };
};
