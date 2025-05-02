import {makeTask, TEMP_TEMP_ROLES} from '#src/clash/task/util/make-task.ts';
import {Server} from '#src/database/arch/codec';
import {S} from '#src/internal/pure/effect.ts';
import {MD} from '#src/internal/pure/pure.ts';
import {DiscordREST} from '#src/util/re-exports';
import {Effect} from 'effect';

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
  (data) => Effect.gen(function* () {
    const discord = yield* DiscordREST;
    yield* discord.createMessage(data.server.raids!, message());
  }),
);
