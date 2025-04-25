import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {deleteDiscordPlayer, type DPlayer, putDiscordPlayer, queryDiscordPlayer} from '#src/dynamo/schema/discord-player.ts';
import {dLinesS} from '#src/internal/discord-old/util/markdown.ts';
import {SlashUserError} from '#src/internal/errors.ts';
import {E} from '#src/internal/pure/effect.ts';
import {Data} from 'effect';

export class RegistrationError extends Data.TaggedError('deepfryer/RegistrationError')<{
  issue: string;
}> {}

export const registerServer = (
  ops: {

  },
) => E.gen(function* () {

});

export const registerServerClan = (
  ops: {},
) => E.gen(function* () {

});

export const registerUser = (
  ops: {},
) => E.gen(function* () {

});

export const registerUserPlayer = (
  ops: {
    user    : string;
    roles   : string[];
    tag     : string;
    apiToken: string;
    kind    : string;
    admin   : string;
    target? : string;
  },
) => E.gen(function* () {
  const tag = yield* ClashOfClans.validateTag(ops.tag);
  const isAdmin = ops.roles.includes(ops.admin);

  if (ops.apiToken === 'admin') {
    if (!isAdmin) {
      return yield* new SlashUserError({issue: 'admin role required'});
    }
    if (!ops.target) {
      return yield* new SlashUserError({issue: 'admin links must have discord_user'});
    }

    const player = yield* ClashOfClans.getPlayer(tag);
    const [dbPlayer, ...rest] = yield* queryDiscordPlayer({sk: `p-${ops.tag}`});

    if (rest.length) {
      return yield* new SlashUserError({issue: 'real bad, this should never happen. call support lol'});
    }

    if (!dbPlayer) {
      yield* putDiscordPlayer(makeDiscordPlayer(ops.target, ops.tag, 1, ops.kind));

      return {
        color      : nColor(COLOR.SUCCESS),
        description: dLinesS(
          'new admin link successful',
          `<@${ops.target}> linked to ${player.name} (${ops.tag}) (${ops.kind})`,
        ),
      };
    }

    yield* deleteDiscordPlayer({pk: dbPlayer.pk, sk: dbPlayer.sk});
    yield* putDiscordPlayer({
      ...dbPlayer,
      account_type: ops.kind,
      pk          : ops.target,
      gsi_user_id : ops.target,
      updated     : new Date(Date.now()),
      verification: 1,
    });

    return {
      color      : nColor(COLOR.SUCCESS),
      description: dLinesS(
        'admin link override successful',
        `<@${ops.target}> linked to ${player.name} (${ops.tag}) (${ops.kind})`,
      ),
    };
  }

  const isValid = yield* ClashOfClans.verifyPlayerToken(ops.tag, ops.apiToken);

  if (!isValid) {
    return yield* new SlashUserError({issue: 'invalid api_token'});
  }

  const player = yield* ClashOfClans.getPlayer(tag);
  const [dbPlayer, ...rest] = yield* queryDiscordPlayer({sk: `p-${ops.tag}`});

  if (!dbPlayer) {
    yield* putDiscordPlayer(makeDiscordPlayer(ops.user, ops.tag, 2, ops.kind));

    return {
      color      : nColor(COLOR.SUCCESS),
      description: dLinesS(
        'new player link verified',
        `<@${ops.user}> linked to ${player.name} (${ops.tag}) (${ops.kind})`,
      ),
    };
  }

  if (rest.length) {
    return yield* new SlashUserError({issue: 'real bad, this should never happen. call support lol'});
  }
  if (dbPlayer.sk === player.tag) {
    return yield* new SlashUserError({issue: 'your account is already linked'});
  }
  if (dbPlayer.verification > 2) {
    return yield* new SlashUserError({issue: 'cannot override verification already present'});
  }

  yield* deleteDiscordPlayer({pk: dbPlayer.pk, sk: dbPlayer.sk});
  yield* putDiscordPlayer({
    ...dbPlayer,
    account_type: ops.kind,
    pk          : ops.user,
    gsi_user_id : ops.user,
    updated     : new Date(Date.now()),
    verification: 2,
  });

  return {
    color      : nColor(COLOR.SUCCESS),
    description: dLinesS(
      'player link overridden',
      `<@${ops.user}> linked to ${player.name} (${ops.tag}) (${ops.kind})`,
    ),
  };
});

const makeDiscordPlayer = (userId: string, playerTag: string, verification: DPlayer['verification'], accountType?: string) => ({
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
