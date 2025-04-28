import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {COLOR, nColor} from '#src/internal/discord-old/constants/colors.ts';
import type {DPlayer} from '#src/internal/discord-old/dynamo/schema/discord-player.ts';
import {deleteDiscordPlayer, putDiscordPlayer, queryDiscordPlayer} from '#src/internal/discord-old/dynamo/schema/discord-player.ts';
import type {St} from '#src/internal/discord-old/store/derive-state.ts';
import type {CommandSpec, IxDS, snflk} from '#src/internal/discord-old/types.ts';
import {dLinesS} from '#src/internal/discord-old/util/markdown.ts';
import {validateServer} from '#src/internal/discord-old/util/validation.ts';
import type {IxD} from '#src/internal/discord-old/discord.ts';
import {SlashUserError} from '#src/internal/errors.ts';
import {E} from '#src/internal/pure/effect.ts';

export const ONE_OF_US = {
  type       : 1,
  name       : 'oneofus',
  description: 'link clash account to discord',
  options    : {
    player_tag: {
      type       : 3,
      name       : 'player_tag',
      description: 'tag for player in-game (ex. #2GR2G0PGG)',
      required   : true,
    },
    api_token: {
      type       : 3,
      name       : 'api_token',
      description: 'player api token from in-game settings',
      required   : true,
    },
    account_kind: {
      type       : 3,
      name       : 'account_kind',
      description: 'how the account is played',
      required   : true,
      choices    : [
        {name: 'main', value: 'main'},
        {name: 'alt', value: 'alt'},
        {name: 'donation', value: 'donation'},
        {name: 'war asset', value: 'war-asset'},
        {name: 'clan capital', value: 'clan-capital'},
        {name: 'strategic rush', value: 'strategic-rush'},
        {name: 'admin parking', value: 'admin-parking'},
      ],
    },
    discord_user: {
      type       : 6,
      name       : 'discord_user',
      description: '[admin_role] discord user account to link player tag',
    },
  },
} as const satisfies CommandSpec;

/**
 * @desc [SLASH /oneofus]
 */
export const oneofus = (data: IxD, options: IxDS<typeof ONE_OF_US>, s?: St) => E.gen(function* () {
  const [server, user] = s
    ? [s.server!, s.original.member!]
    : yield* validateServer(data);

  const tag = yield* ClashOfClans.validateTag(options.player_tag);

  const coc_player = yield* ClashOfClans.getPlayer(tag);

  // server admin role link
  if (options.api_token === 'admin') {
    if (!user.roles.includes(server.admin as snflk)) {
      return yield* new SlashUserError({issue: 'admin role required'});
    }
    if (!options.discord_user) {
      return yield* new SlashUserError({issue: 'admin links must have discord_user'});
    }

    const [player, ...rest] = yield* queryDiscordPlayer({sk: `p-${options.player_tag}`});

    if (rest.length) {
      return yield* new SlashUserError({issue: 'real bad, this should never happen. call support lol'});
    }

    if (!player) {
      yield* putDiscordPlayer(makeDiscordPlayer(options.discord_user, coc_player.tag, 1, options.account_kind));
      return {
        embeds: [{
          color      : nColor(COLOR.SUCCESS),
          description: dLinesS(
            'new admin link successful',
            `<@${options.discord_user}> linked to ${coc_player.name} (${coc_player.tag}) (${options.account_kind})`,
          ),
        }],
      };
    }

    yield* deleteDiscordPlayer({pk: player.pk, sk: player.sk});
    yield* putDiscordPlayer({
      ...player,
      pk          : user.user!.id,
      gsi_user_id : user.user!.id,
      updated     : new Date(Date.now()),
      verification: 1,
    });

    return {
      embeds: [{
        color      : nColor(COLOR.SUCCESS),
        description: dLinesS(
          'admin link override successful',
          `<@${options.discord_user}> linked to ${coc_player.name} (${coc_player.tag}) (${options.account_kind})`,
        ),
      }],
    };
  }

  // COC player API token validity
  const tokenValid = yield* ClashOfClans.verifyPlayerToken(coc_player.tag, options.api_token);

  if (!tokenValid) {
    return yield* new SlashUserError({issue: 'invalid api_token'});
  }

  const [player, ...rest] = yield* queryDiscordPlayer({sk: `p-${options.player_tag}`});

  // new player record
  if (!player) {
    yield* putDiscordPlayer(makeDiscordPlayer(user.user!.id, coc_player.tag, 2, options.account_kind));

    return {
      embeds: [{
        color      : nColor(COLOR.SUCCESS),
        description: dLinesS(
          'new player link verified',
          `<@${user.user!.id}> linked to ${coc_player.name} (${coc_player.tag}) (${options.account_kind})`,
        ),
      }],
    };
  }

  if (rest.length) {
    return yield* new SlashUserError({issue: 'real bad, this should never happen. call support lol'});
  }

  // already linked to current account
  if (player.sk === coc_player.tag) {
    return yield* new SlashUserError({issue: 'your account is already linked'});
  }

  // disallow higher verification override
  if (player.verification > 2) {
    return yield* new SlashUserError({issue: 'cannot override verification already present'});
  }

  // update player record
  yield* deleteDiscordPlayer({pk: player.pk, sk: player.sk});
  yield* putDiscordPlayer({
    ...player,
    pk          : user.user!.id,
    gsi_user_id : user.user!.id,
    updated     : new Date(Date.now()),
    verification: 2,
  });

  return {
    embeds: [{
      color      : nColor(COLOR.SUCCESS),
      description: dLinesS(
        'player link overridden',
        `<@${user.user!.id}> linked to ${coc_player.name} (${coc_player.tag}) (${options.account_kind})`,
      ),
    }],
  };
});

const makeDiscordPlayer
        = (userId: string, playerTag: string, verification: DPlayer['verification'], accountType?: string) => ({
  pk            : userId,
  sk            : playerTag,
  type          : 'DiscordPlayer',
  version       : '1.0.0',
  created       : new Date(Date.now()),
  updated       : new Date(Date.now()),
  alias         : '',
  gsi_user_id   : userId,
  gsi_player_tag: playerTag,
  verification  : verification,
  account_type  : accountType ?? 'main',
} as const);
