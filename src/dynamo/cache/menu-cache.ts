import {C, L} from '#src/internal/pure/effect.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {CompKey} from '#src/dynamo/dynamo.ts';
import type {EA} from '#src/internal/types.ts';
import type {DUser} from '#src/dynamo/schema/discord-user.ts';
import type {DServer} from '#src/dynamo/schema/discord-server.ts';
import {userRead} from '#src/dynamo/operations/user.ts';
import {serverRead} from '#src/dynamo/operations/server.ts';


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


const program = E.gen(function* () {
    const server = yield * servers;
    const user = yield * users;

    return {
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
