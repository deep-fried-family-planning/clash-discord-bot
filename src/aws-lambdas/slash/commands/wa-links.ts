import {fetchWarEntities} from '#src/data/fetch-war-entities.ts';
import {E, pipe} from '#src/internals/re-exports/effect.ts';
import {concatL, mapL, sortL} from '#src/pure/pure-list.ts';
import {fromCompare, OrdN} from '#src/pure/pure.ts';
import type {ClanWarMember} from 'clashofclans.js';
import {COLOR, nColor} from '#src/internals/constants/colors.ts';
import {dBold, dCode, dEmpL, dHdr3, dLine, dLink, dSubH, nNatT} from '#src/discord/markdown.ts';
import {dTable} from '#src/discord/message-table.ts';
import {ApplicationCommandType} from '@discordjs/core/http-only';
import type {CommandSpec, Interaction} from '#src/discord/types.ts';
import type {CmdOps} from '#src/aws-lambdas/slash/types.ts';
import {getAliasTag} from '#src/discord/get-alias-tag.ts';
import {validateServer} from '#src/aws-lambdas/slash/utils.ts';
import {OPTION_CLAN, OPTION_FROM, OPTION_TO} from '#src/aws-lambdas/slash/options.ts';

export const WA_LINKS = {
    type       : ApplicationCommandType.ChatInput,
    name       : 'war-links',
    description: 'get player profile links to rapidly scout enemy war camps',
    options    : {
        ...OPTION_CLAN,
        ...OPTION_FROM,
        ...OPTION_TO,
    },
} as const satisfies CommandSpec;

export const waLinks = (data: Interaction, ops: CmdOps<typeof WA_LINKS>) => E.gen(function * () {
    yield * validateServer(data);

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
