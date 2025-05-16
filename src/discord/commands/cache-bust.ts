import {getAliasTag} from '#src/clash/get-alias-tag.ts';
import {ServerClan} from '#src/database/arch/codec.ts';
import {readItem, saveItem} from '#src/database/DeepFryerDB.ts';
import {nColor} from '#src/internal/discord-old/constants/colors';
import {COLOR} from '#src/internal/discord-old/constants/colors.ts';
import {OPTION_CLAN} from '#src/internal/discord-old/constants/ix-constants.ts';
import type {IxD} from '#src/internal/discord-old/discord.ts';
import type {CommandSpec, IxDS, snflk} from '#src/internal/discord-old/types.ts';
import {validateServer} from '#src/internal/discord-old/validation.ts';
import {SlashUserError} from '#src/internal/errors.ts';
import {CSL, E} from '#src/internal/pure/effect.ts';

export const CACHE_BUST
               = {
  type       : 1,
  name       : 'bust',
  description: 'devs & inner circle ONLY!!!',
  options    : {
    ...OPTION_CLAN,
  },
} as const satisfies CommandSpec;

/**
 * @desc [SLASH /bust]
 */
export const cacheBust = (data: IxD, options: IxDS<typeof CACHE_BUST>) => E.gen(function* () {
  const [server, user] = yield* validateServer(data);

  if (!user.roles.includes(server.admin as snflk)) {
    return yield* new SlashUserError({issue: 'inner circle ONLY!!!'});
  }

  const clanTag = getAliasTag(options.clan);

  yield* CSL.debug(clanTag);

  const clan = yield* readItem(ServerClan, data.guild_id!, clanTag);

  yield* saveItem(ServerClan, {
    ...clan,
    prep_opponent  : '',
    battle_opponent: '',
  });

  return {
    embeds: [{description: 'cache bussin dun cache busted', color: nColor(COLOR.SUCCESS)}],
  };
});
