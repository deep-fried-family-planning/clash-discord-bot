import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {ServerClan, type Server, type UserPlayer} from '#src/data/index.ts';
import {COLOR, nColor} from '#src/internal/discord-old/constants/colors.ts';
import {messageEmbedScout} from '#src/discord/commands/wa-scout.ts';
import {buildGraphModel} from '#src/internal/graph/build-graph-model.ts';
import {describeScout} from '#src/internal/graph/model-descriptive/describe-scout.ts';
import {CSL, E, pipe} from '#src/internal/pure/effect.ts';
import {MD} from '#src/internal/pure/pure.ts';
import {emptyKV} from '#src/internal/pure/pure-kv.ts';
import {reduceL} from '#src/internal/pure/pure-list.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {updateWarCountdown} from '#src/clash/poll/clan-war-countdown.ts';
// import {WarBattle00hr} from '#src/clash/task/war-thread/war-battle-00hr.ts';
// import {WarBattle24Hr} from '#src/clash/task/war-thread/war-battle-24hr.ts';
// import {WarPrep12hr} from '#src/clash/task/war-thread/war-prep-12hr.ts';
// import {WarPrep24hr} from '#src/clash/task/war-thread/war-prep-24hr.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {DiscordREST} from 'dfx';

export const eachClan = (server: Server, clan: ServerClan, players: UserPlayer[]) => E.gen(function* () {
  const discord = yield* DiscordREST;

  const wars = yield* pipe(
    ClashOfClans.getWars(clan.sk),
    E.catchAll(() => ClashOfClans.getCurrentWar(clan.sk).pipe(
      E.map((w) => w ? [w] : []),
      E.catchAll(() => E.succeed([])),
    )),
  );

  yield* E.timeout(updateWarCountdown(clan, wars), '15 second').pipe(E.ignore);

  const prepWar = wars.find((w) => w.isPreparationDay);

  if (!prepWar) {
    return;
  }

  if (clan.prep_opponent === prepWar.opponent.tag) {
    return;
  }

  const group = yield* pipe(
    Scheduler.getScheduleGroup({Name: `s-${clan.pk}-c-${clan.sk.replace('#', '')}`}),
    E.catchTag('ResourceNotFoundException', () => E.succeed({Name: undefined})),
  );

  yield* CSL.log('new schedule group', group);

  if (!group.Name) {
    const newgroup = yield* Scheduler.createScheduleGroup({
      Name: `s-${clan.pk}-c-${clan.sk.replace('#', '')}`,
    });
    yield* CSL.log('new schedule group', newgroup.ScheduleGroupArn);
  }

  const graph = yield* buildGraphModel({
    cid1       : clan.sk,
    exhaustive : false,
    from       : 1,
    to         : 50,
    limit      : 50,
    showCurrent: false,
    showN      : false,
  });
  const scout = describeScout(graph);

  const thread = yield* discord.createThread(server.forum!, {
    name   : `🛠️│${prepWar.clan.name}`,
    message: {
      content: `${prepWar.clan.name} vs. ${prepWar.opponent.name}`,
      embeds : [{
        color    : nColor(COLOR.ORIGINAL),
        thumbnail: {
          url   : prepWar.clan.badge.large,
          height: 256,
          width : 256,
        },
        description: MD.content(
          MD.h1(MD.mask(prepWar.clan.name, prepWar.clan.shareLink)),
          MD.sh('click clan name to open in-game'),
          MD.empty,
          MD.h3('Preparation'),
          MD.sh_tR(prepWar.preparationStartTime.getTime()),
          MD.sh_tR(prepWar.preparationStartTime.getTime()),
          MD.empty,
          MD.h3('Battle'),
          MD.sh_tR(prepWar.startTime.getTime()),
          MD.sh_tR(prepWar.startTime.getTime()),
          MD.empty,
          MD.h3('End'),
          MD.sh_tR(prepWar.endTime.getTime()),
          MD.sh_tR(prepWar.endTime.getTime()),
        ),
      }, {
        color    : nColor(COLOR.ERROR),
        thumbnail: {
          url   : prepWar.opponent.badge.large,
          height: 256,
          width : 256,
        },
        description: MD.content(
          MD.h1(`vs ${MD.mask(prepWar.opponent.name, prepWar.opponent.shareLink)}`),
          MD.sh('click clan name to open in-game'),
        ),
      }, {
        color      : nColor(COLOR.ERROR),
        description: messageEmbedScout(scout).join(''),
      }],
    },
    auto_archive_duration: 1440,
  });

  yield* ServerClan.put({
    Item: {
      ...clan,
      prep_opponent: prepWar.opponent.tag,
      thread_prep  : thread.id,
    },
  });

  const links = pipe(
    players,
    reduceL(emptyKV<str, str>(), (ps, p) => {
      ps[p.sk] = p.pk;
      return ps;
    }),
  );

  yield* E.all([
    // WarPrep24hr.send(prepWar.preparationStartTime, '0 hour', server, clan, prepWar, thread, links),
    // WarPrep12hr.send(prepWar.preparationStartTime, '12 hour', server, clan, prepWar, thread, links),
    // WarPrep06hr.send(prepWar.preparationStartTime, '18 hour', server, clan, prepWar, thread, links),
    // WarPrep02hr.send(prepWar.preparationStartTime, '22 hour', server, clan, prepWar, thread, links),

    // WarBattle24Hr.send(prepWar.startTime, '0 hour', server, clan, prepWar, thread, links),
    // WarBattle12hr.send(prepWar.startTime, '12 hour', server, clan, prepWar, thread, links),
    // WarBattle06hr.send(prepWar.startTime, '18 hour', server, clan, prepWar, thread, links),
    // WarBattle02hr.send(prepWar.startTime, '22 hour', server, clan, prepWar, thread, links),
    // WarBattle01hr.send(prepWar.startTime, '23 hour', server, clan, prepWar, thread, links),

    // WarBattle00hr.send(prepWar.endTime, '1 hour', server, clan, prepWar, thread, links),
  ]);
});
