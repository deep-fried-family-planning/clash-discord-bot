import {C, L} from '#src/internal/pure/effect.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {CompKey} from '#src/dynamo/dynamo.ts';
import type {EA} from '#src/internal/types.ts';
import type {DUser} from '#src/dynamo/schema/discord-user.ts';
import type {DServer} from '#src/dynamo/schema/discord-server.ts';
import {userRead} from '#src/dynamo/operations/user.ts';
import {serverRead} from '#src/dynamo/operations/server.ts';
import type {DEmbed} from '#src/dynamo/schema/discord-embed.ts';
import {discordEmbedRead} from '#src/dynamo/operations/embed.ts';


const users = C.make({
    capacity  : 100,
    timeToLive: '10 minutes',
    lookup    : (userId: CompKey<DUser>['pk']) => userRead(userId),
});


const servers = C.make({
    capacity  : 100,
    timeToLive: '10 minutes',
    lookup    : (serverId: CompKey<DServer>['pk']) => serverRead(serverId),
});


const embeds = C.make({
    capacity  : 100,
    timeToLive: '10 minutes',
    lookup    : (embedId: CompKey<DEmbed>['pk']) => discordEmbedRead(embedId),
});


const program = E.gen(function* () {
    const server = yield * servers;
    const user = yield * users;
    const embed = yield * embeds;

    return {
        embedRead       : (...p: Parameters<typeof embed.get>) => embed.get(...p),
        embedSet        : (...p: Parameters<typeof embed.set>) => embed.set(...p),
        embedInvalidate : (...p: Parameters<typeof embed.invalidate>) => embed.invalidate(...p),
        serverRead      : (...p: Parameters<typeof server.get>) => server.get(...p),
        serverSet       : (...p: Parameters<typeof server.set>) => server.set(...p),
        serverInvalidate: (...p: Parameters<typeof server.invalidate>) => server.invalidate(...p),
        userRead        : (...p: Parameters<typeof user.get>) => user.get(...p),
        userSet         : (...p: Parameters<typeof user.set>) => user.set(...p),
        userInvalidate  : (...p: Parameters<typeof user.invalidate>) => user.invalidate(...p),
    };
});


export class MenuCache extends E.Tag('MenuCache')<
    MenuCache,
    EA<typeof program>
>() {
    static Live = L.effect(this, program);
}
