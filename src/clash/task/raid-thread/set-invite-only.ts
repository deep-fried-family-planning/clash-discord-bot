import {makeTask, TEMP_TEMP_ROLES} from '#src/clash/task/util/make-task.ts';
import {Server} from '#src/database/arch/codec.ts';
import {S} from '#src/internal/pure/effect.ts';
import {MD} from '#src/internal/pure/pure.ts';
import {DiscordREST} from 'dfx';
import {Effect} from 'effect';

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
  (data) => Effect.gen(function* () {
    const discord = yield* DiscordREST;
    yield* discord.createMessage(data.server.raids!, message());
  }),
);
