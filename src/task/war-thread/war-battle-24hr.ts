import {E, pipe} from '#src/internal/pure/effect.ts';
import {makeTask} from '#src/task/war-thread/common.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {dLinesS, dmUser} from '#src/discord/util/markdown.ts';
import {mapL, sortL} from '#src/internal/pure/pure-list.ts';
import {fromCompare, OrdN} from '#src/internal/pure/pure.ts';
import type {ClanWarMember} from 'clashofclans.js';


export const WarBattle24Hr = makeTask('WarBattle24Hr', (data, war) => E.gen(function * () {
    yield * DiscordApi.modifyChannel(data.thread, {
        name: `🗡│${data.clanName}`,
    });

    yield * DiscordApi.createMessage(data.thread, {
        content: dLinesS(
            '[BATTLE_DAY]: Roster',
            ...pipe(
                war.battle.clan.members,
                sortL(fromCompare<ClanWarMember>((a, b) => OrdN(a.mapPosition, b.mapPosition))),
                mapL((m) => `1. ${dmUser(data.links[m.tag])} (${m.name})`),
            ),
        ),
    });
}));
