import {makeTask, TEMP_TEMP_ROLES} from '#src/clash/task/util/make-task.ts';
import {Server} from '#src/database/arch/codec';
import {DiscordApi} from '#src/internal/discord-old/layer/discord-api.ts';
import {g, S} from '#src/internal/pure/effect.ts';
import {MD} from '#src/internal/pure/pure.ts';

const message = () => ({
  content: MD.content(
    MD.h1('Raids: Quarantine Lifted'),
    MD.sh(MD.spoiler(MD.m_role(TEMP_TEMP_ROLES.staff))),
    'Please set clans to **Anyone Can Join** now that the raid weekend is almost complete.',
  ),
});

export const SetOpen = makeTask(
  S.Literal('SetOpen'),
  S.Struct({
    server: Server.Schema,
  }),
  (data) => g(function* () {
    yield* DiscordApi.createMessage(data.server.raids!, message());
  }),
);
