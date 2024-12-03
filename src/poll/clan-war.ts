import {type DClan, putDiscordClan} from '#src/dynamo/schema/discord-clan.ts';
import type {DServer} from '#src/dynamo/schema/discord-server.ts';
import {CSL, E, pipe} from '#src/internal/pure/effect.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {DiscordREST} from 'dfx';
import {ClanCache} from '#src/dynamo/cache/clan-cache.ts';
import {updateWarCountdown} from '#src/poll/update-war-countdowns.ts';
import {WarBattle00hr} from '#src/task/war-thread/war-battle-00hr.ts';
import {WarPrep24hr} from '#src/task/war-thread/war-prep-24hr.ts';
import type {DPlayer} from '#src/dynamo/schema/discord-player.ts';
import {reduceL} from '#src/internal/pure/pure-list.ts';
import {emptyKV} from '#src/internal/pure/pure-kv.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {WarBattle12hr} from '#src/task/war-thread/war-battle-12hr.ts';
import {WarPrep12hr} from '#src/task/war-thread/war-prep-12hr.ts';
import {WarPrep06hr} from '#src/task/war-thread/war-prep-06hr.ts';
import {WarPrep02hr} from '#src/task/war-thread/war-prep-02hr.ts';
import {WarBattle06hr} from '#src/task/war-thread/war-battle-06hr.ts';
import {WarBattle02hr} from '#src/task/war-thread/war-battle-02hr.ts';
import {WarBattle01hr} from '#src/task/war-thread/war-battle-01hr.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {dHdr1, dHdr3, dLinesS, dSubH, dtFul, dtRel} from '#src/discord/util/markdown.ts';
import {buildGraphModel} from '#src/internal/graph/build-graph-model.ts';
import {describeScout} from '#src/internal/graph/model-descriptive/describe-scout.ts';
import {messageEmbedScout} from '#src/discord/commands/wa-scout.ts';
import {WarBattle24Hr} from '#src/task/war-thread/war-battle-24hr.ts';


export const eachClan = (server: DServer, clan: DClan, players: DPlayer[]) => E.gen(function * () {
    const discord = yield * DiscordREST;

    const wars = yield * pipe(
        ClashOfClans.getWars(clan.sk),
        E.catchAll(() => ClashOfClans.getCurrentWar(clan.sk).pipe(
            E.map((w) => w ? [w] : []),
            E.catchAll(() => E.succeed([])),
        )),
    );

    yield * E.timeout(updateWarCountdown(clan, wars), '5 second').pipe(E.ignore);

    const prepWar = wars.find((w) => w.isPreparationDay);

    if (!prepWar) {
        return;
    }

    if (clan.prep_opponent === prepWar.opponent.tag) {
        return;
    }

    const group = yield * pipe(
        Scheduler.getScheduleGroup({Name: `s-${clan.pk}-c-${clan.sk.replace('#', '')}`}),
        E.catchTag('ResourceNotFoundException', () => E.succeed({Name: undefined})),
    );

    yield * CSL.log('new schedule group', group);

    if (!group.Name) {
        const newgroup = yield * Scheduler.createScheduleGroup({
            Name: `s-${clan.pk}-c-${clan.sk.replace('#', '')}`,
        });
        yield * CSL.log('new schedule group', newgroup.ScheduleGroupArn);
    }

    const graph = yield * buildGraphModel({
        cid1       : clan.sk,
        exhaustive : false,
        from       : 1,
        to         : 50,
        limit      : 50,
        showCurrent: false,
        showN      : false,
    });
    const scout = describeScout(graph);

    const thread = yield * discord.startThreadInForumOrMediaChannel(server.forum!, {
        name   : `🛠️│${prepWar.clan.name}`,
        // @ts-expect-error dfx types need to be fixed
        message: {
            content: `${prepWar.clan.name} vs. ${prepWar.opponent.name}`,
            embeds : [{
                color    : nColor(COLOR.ORIGINAL),
                thumbnail: {
                    url   : prepWar.clan.badge.large,
                    height: 256,
                    width : 256,
                },
                description: dLinesS(
                    dHdr1(`[${prepWar.clan.name}](${prepWar.clan.shareLink})`),
                    dSubH('click clan name to open in-game'),

                    dHdr3('Preparation'),
                    dSubH(dtFul(prepWar.preparationStartTime.getTime())),
                    dSubH(dtRel(prepWar.preparationStartTime.getTime())),

                    dHdr3('Battle'),
                    dSubH(dtFul(prepWar.startTime.getTime())),
                    dSubH(dtRel(prepWar.startTime.getTime())),

                    dHdr3('End'),
                    dSubH(dtFul(prepWar.endTime.getTime())),
                    dSubH(dtRel(prepWar.endTime.getTime())),
                ),
            }, {
                color    : nColor(COLOR.ERROR),
                thumbnail: {
                    url   : prepWar.opponent.badge.large,
                    height: 256,
                    width : 256,
                },
                description: dLinesS(
                    dHdr1(`vs [${prepWar.opponent.name}](${prepWar.opponent.shareLink})`),
                    dSubH('click clan name to open in-game'),
                ),
            }, {
                color      : nColor(COLOR.ERROR),
                description: messageEmbedScout(scout).join(''),
            }],
        },
        auto_archive_duration: 1440,
    }).json;

    const updatedClan = yield * putDiscordClan({
        ...clan,
        prep_opponent: prepWar.opponent.tag,
        thread_prep  : thread.id,
    });

    yield * ClanCache.set(`${updatedClan.pk}/${updatedClan.sk}`, updatedClan);

    const links = pipe(
        players,
        reduceL(emptyKV<str, str>(), (ps, p) => {
            ps[p.sk] = p.pk;
            return ps;
        }),
    );

    const now = new Date(Date.now());

    yield * E.all([
        WarPrep24hr.send(prepWar.preparationStartTime, '0 hour', server, clan, prepWar, thread, links),
        WarPrep12hr.send(prepWar.preparationStartTime, '12 hour', server, clan, prepWar, thread, links),
        WarPrep06hr.send(prepWar.preparationStartTime, '18 hour', server, clan, prepWar, thread, links),
        WarPrep02hr.send(prepWar.preparationStartTime, '22 hour', server, clan, prepWar, thread, links),

        WarBattle24Hr.send(prepWar.startTime, '0 hour', server, clan, prepWar, thread, links),
        WarBattle12hr.send(prepWar.startTime, '12 hour', server, clan, prepWar, thread, links),
        WarBattle06hr.send(prepWar.startTime, '18 hour', server, clan, prepWar, thread, links),
        WarBattle02hr.send(prepWar.startTime, '22 hour', server, clan, prepWar, thread, links),
        WarBattle01hr.send(prepWar.startTime, '23 hour', server, clan, prepWar, thread, links),

        WarBattle00hr.send(prepWar.endTime, '0 hour', server, clan, prepWar, thread, links),
    ]);
});
