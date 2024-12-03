import {E, pipe} from '#src/internal/pure/effect.ts';
import {makeTask} from '#src/task/war-thread/common.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {dHdr1, dHdr3, dLinesS, dmUser, dtRel} from '#src/discord/util/markdown.ts';
import {mapL, sortL} from '#src/internal/pure/pure-list.ts';
import {fromCompare, OrdN} from '#src/internal/pure/pure.ts';
import type {ClanWarMember} from 'clashofclans.js';


export const WarBattle24Hr = makeTask('WarBattle24Hr', (data, war) => E.gen(function * () {
    yield * DiscordApi.modifyChannel(data.thread, {
        name: `🗡│${data.clanName}`,
    });

    yield * DiscordApi.createMessage(data.thread, {
        content: dLinesS(
            dHdr1(`${data.clanName} | Battle ends ${dtRel(war.battle.endTime.getTime())}`),
            ...pipe(
                war.battle.clan.members,
                sortL(fromCompare<ClanWarMember>((a, b) => OrdN(a.mapPosition, b.mapPosition))),
                mapL((m) => `1. ${dmUser(data.links[m.tag])} (${m.name})`),
            ),

            dHdr3('Reminders'),
            '1. Always use hero/power potions if not max',
            '2. ALWAYS bring a poison spell!!!',
            '3. [CWL only] WAIT to attack until base call strategy is ready for this war.',
        ),
    });
}));
