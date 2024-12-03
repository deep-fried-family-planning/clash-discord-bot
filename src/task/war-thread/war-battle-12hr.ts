import {E, pipe} from '#src/internal/pure/effect.ts';
import {makeTask} from '#src/task/war-thread/common.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {dCrss, dHdr1, dLinesS, dmUser, dSubH, dtRel} from '#src/discord/util/markdown.ts';
import {filterL, mapL, reduceL, sortL} from '#src/internal/pure/pure-list.ts';
import {fromCompare, OrdN} from '#src/internal/pure/pure.ts';
import type {ClanWarAttack} from 'clashofclans.js';
import type {ClanWarMember} from 'clashofclans.js';
import type {snflk} from '#src/discord/types.ts';
import {AllowedMentionType} from 'dfx/types';


export const WarBattle12hr = makeTask('WarBattle12hr', (data, war) => E.gen(function * () {
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
            dHdr1(`${data.clanName} | Battle ${dtRel(war.battle.endTime.getTime())}`),
            dSubH('strikethrough = did all hits'),
            ...pipe(
                p,
                mapL((p) => {
                    if (p[0].tag in hits && hits[p[0].tag].length === maxHits) {
                        return `1. ${dCrss(p[1].replace('1. ', ''))}`;
                    }
                    return p[1];
                }),
            ),
        ),
        allowed_mentions: {
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
            ),
        },
    });
}));
