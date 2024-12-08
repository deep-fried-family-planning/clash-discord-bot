import {g, S} from '#src/internal/pure/effect';
import {makeTask, TEMP_TEMP_ROLES} from '#src/task/util/make-task.ts';
import {DiscordServer} from '#src/dynamo/schema/discord-server.ts';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import {MD} from '#src/internal/pure/pure';


const message = () => ({
    content: MD.content(
        MD.h1('Raids: Quarantine In Effect'),
        MD.sh(MD.spoiler(MD.m_role(TEMP_TEMP_ROLES.staff))),
        'Please set clans to **Invite Only** to protect ourselves from bots in preparation of the raid weekend.',
    ),
});


export const SetInviteOnly = makeTask(
    S.Literal('SetInviteOnly'),
    S.Struct({
        server: DiscordServer,
    }),
    (data) => g(function * () {
        yield * DiscordApi.createMessage(data.server.raids!, message());
    }),
);
