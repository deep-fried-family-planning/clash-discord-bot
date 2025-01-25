import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import type {snflk} from '#src/discord/types.ts';
import {dBold, dCrss, dHdr1, dHdr2, dHdr3, dLinesS, dmUser, dSpoi, dSubH, dtRel} from '#src/discord/util/markdown.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {dedupeL, filterL, mapL, reduceL, sortL} from '#src/internal/pure/pure-list.ts';
import {fromCompare, OrdN} from '#src/internal/pure/pure.ts';
import {makeTask, TEMP_ROLES} from '#src/task/war-thread/common.ts';
import type {ClanWarAttack, ClanWarMember} from 'clashofclans.js';
import {join} from 'effect/Array';



export const WarBattle12hr = makeTask('WarBattle12hr', (data, war) => E.gen(function * () {
  const maxHits = war.battle.attacksPerMember;
  const hits    = pipe(
    war.battle.clan.attacks,
    reduceL({} as Record<string, ClanWarAttack[]>, (acc, attack) => {
      if (attack.attackerTag in acc) {
        acc[attack.attackerTag].push(attack);
      }
      else {
        acc[attack.attackerTag] = [attack];
      }
      return acc;
    }),
  );
  const p       = pipe(
    war.battle.clan.members,
    sortL(fromCompare<ClanWarMember>((a, b) => OrdN(a.mapPosition, b.mapPosition))),
    mapL((m) => [m, `${dmUser(data.links[m.tag])} (${m.name})`] as const),
  );
  yield * DiscordApi.createMessage(data.thread, {
    content: dLinesS(
      dHdr1(data.clanName),
      dHdr3(`Battle ends ${dtRel(war.battle.endTime.getTime())}`),
      dSubH(`pings: ${pipe(
        p,
        mapL((p) => {
          if (p[0].tag in hits && hits[p[0].tag].length === maxHits) {
            return dCrss(p[1]);
          }
          return p[1];
        }),
        join(' '),
        dSpoi,
      )}`),
      dHdr2('Reminders'),
      '1. Always use hero/power potions if not max',
      '2. ALWAYS bring a poison spell',
      `3. ${dBold('[CWL] Check thread pinned messages for most updated base calls.')}`,
    ),
    // @ts-expect-error dfx types slightly wrong
    allowed_mentions: {
      roles: [
        TEMP_ROLES.warmanager,
        TEMP_ROLES.colead,
        TEMP_ROLES.donator,
        TEMP_ROLES.staff,
      ] as snflk[],
      users: pipe(
        p,
        filterL((p) => {
          if (p[0].tag in hits && hits[p[0].tag].length === maxHits) {
            return false;
          }
          return true;
        }),
        mapL((p) => {
          return data.links[p[0].tag] as snflk;
        }),
        dedupeL,
      ),
    },
  });
}));
