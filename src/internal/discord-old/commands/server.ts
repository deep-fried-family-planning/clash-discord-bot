import {COLOR, nColor} from '#src/constants/colors.ts';
import {OPTION_TZ} from '#src/constants/ix-constants.ts';
import type {CommandSpec, IxDS, snflk} from '#src/internal/discord-old/types.ts';
import {dLinesS} from '#src/internal/discord-old/util/markdown.ts';
import {validateServer} from '#src/internal/discord-old/util/validation.ts';
import {putDiscordServer} from '#src/dynamo/schema/discord-server.ts';
import type {IxD} from '#src/internal/discord.ts';
import {SlashUserError} from '#src/internal/errors.ts';
import {E} from '#src/internal/pure/effect.ts';



export const SERVER
               = {
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
export const server = (data: IxD, options: IxDS<typeof SERVER>) => E.gen(function * () {
  const [server, user] = yield * validateServer(data).pipe(E.catchAll(() => E.succeed([undefined, data.member!] as const)));

  if (server) {
    if (!user.roles.includes(server.admin as snflk)) {
      return yield * new SlashUserError({issue: `role required: <@&${server.admin}>`});
    }

    yield * putDiscordServer({
      ...server,
      updated: new Date(Date.now()),
      admin  : options.admin,
      forum  : options.forum,
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

  yield * putDiscordServer({
    pk               : data.guild_id!,
    sk               : 'now',
    type             : 'DiscordServer',
    version          : '1.0.0',
    admin            : options.admin,
    forum            : options.forum,
    created          : new Date(Date.now()),
    updated          : new Date(Date.now()),
    gsi_all_server_id: data.guild_id!,
    polling          : true,
    alias            : '',
    name             : '',
    desc             : '',
  });

  return {
    embeds: [{
      color      : nColor(COLOR.SUCCESS),
      description: 'new server link created',
    }],
  };
});
