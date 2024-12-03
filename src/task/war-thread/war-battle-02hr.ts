import {makeTask, TEMP_ROLES} from '#src/task/war-thread/common.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {dCrss, dHdr1, dHdr3, dLinesS, dmUser, dSubH, dtRel} from '#src/discord/util/markdown.ts';
import {dedupeL, filterL, mapL, reduceL, sortL} from '#src/internal/pure/pure-list.ts';
import type {ClanWarAttack, ClanWarMember} from 'clashofclans.js';
import {fromCompare, OrdN} from '#src/internal/pure/pure.ts';
import type {snflk} from '#src/discord/types.ts';

export const WarBattle02hr = makeTask('WarBattle02hr', (data, war) => E.gen(function * () {
    const maxHits = war.battle.attacksPerMember;
    const hits = pipe(
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
    const p = pipe(
        war.battle.clan.members,
        sortL(fromCompare<ClanWarMember>((a, b) => OrdN(a.mapPosition, b.mapPosition))),
        mapL((m) => [m, `1. ${dmUser(data.links[m.tag])} (${m.name})`] as const),
    );
    yield * DiscordApi.createMessage(data.thread, {
        content: dLinesS(
            dHdr1(`${data.clanName} | Battle ends ${dtRel(war.battle.endTime.getTime())}`),
            dSubH('strikethrough = did *all* hits'),
            ...pipe(
                p,
                mapL((p) => {
                    if (p[0].tag in hits && hits[p[0].tag].length === maxHits) {
                        return `1. ${dCrss(p[1].replace('1. ', ''))}`;
                    }
                    return p[1];
                }),
            ),

            dHdr3('Reminders'),
            '1. Always use hero/power potions if not max',
            '2. ALWAYS bring a poison spell!!!',
            '3. If you plan to double-dip hero potions, let the clan know and make sure your timing is accurate!',
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
