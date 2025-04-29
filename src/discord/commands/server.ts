import {Server} from '#src/database/arch/codec';
import {saveItem} from '#src/database/DeepFryerDB.ts';
import {COLOR, nColor} from '#src/internal/discord-old/constants/colors.ts';
import {OPTION_TZ} from '#src/internal/discord-old/constants/ix-constants.ts';
import type {IxD} from '#src/internal/discord-old/discord.ts';
import type {CommandSpec, IxDS, snflk} from '#src/internal/discord-old/types.ts';
import {dLinesS} from '#src/internal/discord-old/util/markdown.ts';
import {validateServer} from '#src/internal/discord-old/util/validation.ts';
import {SlashUserError} from '#src/internal/errors.ts';
import {E} from '#src/internal/pure/effect.ts';

export const SERVER = {
  type       : 1,
  name       : 'server',
  description: 'link discord server to deepfryer',
  options    : {
    admin: {
      type       : 8,
      name       : 'admin',
      description: 'oomgaboomga',
      required   : true,
    },
    forum: {
      type       : 7,
      name       : 'forum',
      description: 'oomgaboomga',
      required   : true,
    },
    tz: {
      ...OPTION_TZ.tz,
    },
  },
} as const satisfies CommandSpec;

/**
 * @desc [SLASH /server]
 */
export const server = (data: IxD, options: IxDS<typeof SERVER>) => E.gen(function* () {
  const [server, user] = yield* validateServer(data).pipe(E.catchAll(() => E.succeed([undefined, data.member!] as const)));

  if (server) {
    if (!user.roles.includes(server.admin as snflk)) {
      return yield* new SlashUserError({issue: `role required: <@&${server.admin}>`});
    }

    yield* saveItem(Server, {
      ...server,
      admin: options.admin,
      forum: options.forum,
    });

    return {
      embeds: [{
        color      : nColor(COLOR.SUCCESS),
        description: dLinesS(
          'server link updated',
        ),
      }],
    };
  }

  yield* saveItem(Server, {
    _tag             : 'Server',
    pk               : data.guild_id!,
    sk               : 'now',
    version          : 0,
    admin            : options.admin,
    forum            : options.forum,
    created          : undefined,
    updated          : undefined,
    gsi_all_server_id: data.guild_id!,
    polling          : true,
  });

  return {
    embeds: [{
      color      : nColor(COLOR.SUCCESS),
      description: 'new server link created',
    }],
  };
});
