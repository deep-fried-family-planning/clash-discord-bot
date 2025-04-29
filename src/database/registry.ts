import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {UserPlayer} from '#src/database/data/codec.ts';
import {deleteItem, queryUserPlayers, saveItem} from '#src/database/db.ts';
import {COLOR, nColor} from '#src/internal/discord-old/constants/colors.ts';
import {dLinesS} from '#src/internal/discord-old/util/markdown.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {Embed} from 'dfx/types';
import {Data} from 'effect';

export class RegistrationError extends Data.TaggedError('deepfryer/RegistrationError')<{
  issue: string;
}> {}

export class RegistrationDefect extends Data.TaggedError('deepfryer/RegistrationDefect')<{
  issue: string;
}> {}

export const registerServer = () => E.gen(function* () {

});

export const updateRegisteredServer = () => E.gen(function* () {

});

export const registerServerClan = () => E.gen(function* () {

});

export const updateRegisteredServerClan = () => E.gen(function* () {

});

export const registerUser = (ops: {}) => E.gen(function* () {

});

export const updateRegisteredUser = (ops: {}) => E.gen(function* () {

});

export const registerUserPlayers = (ops: {}) => E.gen(function* () {

});

type UserPlayerRegistrationOps = {
  user    : string;
  roles   : string[];
  tag     : string;
  apiToken: string;
  kind    : string;
  admin   : string;
  target? : string;
};

export const registerUserPlayer = (ops: UserPlayerRegistrationOps) => E.gen(function* () {
  const tag = yield* ClashOfClans.validateTag(ops.tag);
  const isAdmin = ops.roles.includes(ops.admin);

  if (ops.apiToken === 'admin') {
    if (!isAdmin) {
      return yield* new RegistrationError({issue: 'admin role required'});
    }
    if (!ops.target) {
      return yield* new RegistrationError({issue: 'admin links must have discord_user'});
    }

    const player = yield* ClashOfClans.getPlayer(tag);
    const [dbPlayer, ...rest] = yield* queryUserPlayers(ops.tag);

    if (rest.length) {
      return yield* new RegistrationDefect({issue: 'Index Defect'});
    }

    if (!dbPlayer) {
      const item = UserPlayer.make({
        pk            : ops.target,
        sk            : ops.tag,
        gsi_user_id   : ops.target,
        gsi_player_tag: ops.tag,
        name          : player.name,
        verification  : 1,
        account_type  : ops.kind,
      });

      yield* saveItem(UserPlayer, item);

      return {
        color      : nColor(COLOR.SUCCESS),
        description: dLinesS(
          'New admin link',
          `<@${item.pk}> linked to ${item.name} (${item.sk}) (${item.account_type})`,
        ),
      } as Embed;
    }

    yield* deleteItem(
      UserPlayer,
      dbPlayer.pk,
      dbPlayer.sk,
    );

    const item = UserPlayer.make({
      pk            : ops.target,
      sk            : ops.tag,
      gsi_user_id   : ops.target,
      gsi_player_tag: ops.tag,
      name          : player.name,
      verification  : 1,
      account_type  : ops.kind,
    });

    yield* saveItem(UserPlayer, item);

    return {
      color      : nColor(COLOR.SUCCESS),
      description: dLinesS(
        'Admin override link',
        `<@${item.pk}> linked to ${item.name} (${item.sk}) (${item.account_type})`,
      ),
    } as Embed;
  }

  const isValid = yield* ClashOfClans.verifyPlayerToken(ops.tag, ops.apiToken);

  if (!isValid) {
    return yield* new RegistrationError({
      issue: 'Invalid api_token.',
    });
  }

  const player = yield* ClashOfClans.getPlayer(tag);
  const [dbPlayer, ...rest] = yield* queryUserPlayers(ops.tag);

  if (!dbPlayer) {
    const item = UserPlayer.make({
      pk            : ops.user,
      sk            : ops.tag,
      gsi_user_id   : ops.user,
      gsi_player_tag: ops.tag,
      name          : player.name,
      verification  : 2,
      account_type  : ops.kind,
    });

    yield* saveItem(UserPlayer, item);

    return {
      color      : nColor(COLOR.SUCCESS),
      description: dLinesS(
        'New player link verified',
        `<@${item.pk}> linked to ${item.name} (${item.sk}) (${item.account_type})`,
      ),
    } as Embed;
  }

  if (rest.length) {
    return yield* new RegistrationDefect({issue: 'Index Defect'});
  }
  if (dbPlayer.sk === player.tag) {
    return yield* new RegistrationError({
      issue: 'Account is already linked',
    });
  }
  if (dbPlayer.verification > 2) {
    return yield* new RegistrationError({
      issue: 'You cannot override this account link',
    });
  }

  yield* deleteItem(
    UserPlayer,
    dbPlayer.pk,
    dbPlayer.sk,
  );

  const item = UserPlayer.make({
    pk            : ops.user,
    sk            : ops.tag,
    gsi_user_id   : ops.user,
    gsi_player_tag: ops.tag,
    name          : player.name,
    verification  : 2,
    account_type  : ops.kind,
  });

  yield* saveItem(UserPlayer, item);

  return {
    color      : nColor(COLOR.SUCCESS),
    description: dLinesS(
      'Player link overridden.',
      `<@${item.pk}> linked to ${item.name} (${item.sk}) (${item.account_type})`,
    ),
  } as Embed;
});
