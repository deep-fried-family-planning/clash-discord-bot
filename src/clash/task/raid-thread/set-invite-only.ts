import {Server} from '#src/database/arch/codec.ts';
import {DiscordApi} from '#src/internal/discord-old/layer/discord-api.ts';
import {g, S} from '#src/internal/pure/effect.ts';
import {MD} from '#src/internal/pure/pure.ts';
import {makeTask, TEMP_TEMP_ROLES} from '#src/clash/task/util/make-task.ts';

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
    server: Server.Schema,
  }),
  (data) => g(function* () {
    yield* DiscordApi.createMessage(data.server.raids!, message());
  }),
);
