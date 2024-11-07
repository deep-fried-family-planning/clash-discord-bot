import {discord} from '#src/https/api-discord.ts';
import {fetchWarEntities} from '#src/discord/command-util/fetch-war-entities.ts';
import {notFound} from '@hapi/boom';
import {pipe} from '#src/internals/re-exports/effect.ts';
import {concatL, mapL, sortL} from '#src/pure/pure-list.ts';
import {fromCompare, OrdN} from '#src/pure/pure.ts';
import type {ClanWarMember} from 'clashofclans.js';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {dBold, dCode, dEmpL, dHdr1, dLine, dLinesS, dLink, dSubH, nNatT} from '#src/discord/helpers/markdown.ts';
import {dTable} from '#src/discord/command-util/message-table.ts';
import {DFFP_CLANS_ALIAS} from '#src/constants/dffp-alias.ts';
import {buildGraphModel} from '#src/data/build-graph-model.ts';
import {describeScout} from '#src/data/model-descriptive/describe-scout.ts';
import {messageEmbedScout} from '#src/discord/command-util/message-embed-scout.ts';

export const createWarThreadWithExtraStuff = async () => {
    const ops = {
        exhaustive : true,
        from       : 0,
        limit      : 50,
        showCurrent: false,
        showN      : false,
        to         : 0,
        cid1       : DFFP_CLANS_ALIAS.dffp,
    };

    const entities = await fetchWarEntities(ops);

    if (!entities.currentWar.length) {
        throw notFound('no current war found');
    }

    const graph = await buildGraphModel(ops, entities);
    const scout = describeScout(graph);

    const war = entities.currentWar[0];

    const opponentMembers = pipe(
        war.opponent.members,
        sortL(fromCompare<ClanWarMember>((a, b) => OrdN(a.mapPosition, b.mapPosition))),
    );

    await discord.channels.createForumThread('1298083257010753577', {
        name   : war.clan.name,
        message: {
            content: dLinesS(
                dSubH(war.clan.name),
                dSubH(war.clan.tag),
                dSubH(war.opponent.name),
                dSubH(war.opponent.tag),
                dSubH(war.preparationStartTime.toUTCString()),
            ),
            embeds: [{
                color      : nColor(COLOR.ORIGINAL),
                description: dLinesS(dHdr1(war.clan.name), dSubH(war.clan.tag)),
                thumbnail  : {url: war.clan.badge.url},
            }, {
                color      : nColor(COLOR.ORIGINAL),
                description: dLinesS(dHdr1(war.opponent.name), dSubH(war.opponent.tag)),
                thumbnail  : {url: war.opponent.badge.url},
            }, {
                color      : nColor(COLOR.INFO),
                description: messageEmbedScout(scout).join(''),
            }, {
                color      : nColor(COLOR.INFO),
                description: pipe(
                    [
                        dLink('click to open opponent clan in-game', war.opponent.shareLink),
                        dEmpL(),
                    ],
                    concatL(pipe(
                        [['wr', 'th', 'tag', 'name/link']],
                        concatL(pipe(opponentMembers, mapL((m, idx) =>
                            [nNatT(idx), nNatT(m.townHallLevel), m.tag, dCode(dBold(dLink(m.name, m.shareLink)))],
                        ))),
                        dTable,
                        mapL(dCode),
                    )),
                    concatL([dSubH('click the highlighted names to open in-game')]),
                    mapL(dLine),
                ).join(''),
            }],
        },
        auto_archive_duration: 1440,
    });
};
