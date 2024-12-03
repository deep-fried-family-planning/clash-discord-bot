import {E, pipe} from '#src/internal/pure/effect.ts';
import {makeTask} from '#src/task/war-thread/common.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {dHdr1, dLinesS, dmUser} from '#src/discord/util/markdown.ts';
import {mapL, sortL} from '#src/internal/pure/pure-list.ts';
import {fromCompare, OrdN} from '#src/internal/pure/pure.ts';
import type {ClanWarMember} from 'clashofclans.js';


export const WarBattle12hr = makeTask('WarBattle12hr', (data, war) => E.gen(function * () {
    yield * DiscordApi.createMessage(data.thread, {
        content: dLinesS(
            dHdr1(`${data.clanName} | Battle [T-12:00]`),
        ),
    });
}));
