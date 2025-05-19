import {getAliasTag} from '#src/clash/get-alias-tag.ts';
import {ServerClan} from '#src/data';
import {COLOR, nColor} from '#src/discord/old/colors.ts';
import {OPTION_CLAN} from '#src/discord/old/ix-constants.ts';
import type {CommandSpec, IxDS, snflk} from '#src/discord/old/types.ts';
import {validateServer} from '#src/discord/old/validation.ts';
import {SlashUserError} from '#src/internal/errors.ts';
import * as E from 'effect/Effect';
import * as CSL from 'effect/Console';
import type {Discord} from 'dfx';

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
export const cacheBust = (data: Discord.APIInteraction, options: IxDS<typeof CACHE_BUST>) => E.gen(function* () {
  const [server, user] = yield* validateServer(data);

  if (!user.roles.includes(server.admin as snflk)) {
    return yield* new SlashUserError({issue: 'inner circle ONLY!!!'});
  }

  const clanTag = getAliasTag(options.clan);

  yield* CSL.debug(clanTag);

  const clan = yield* ServerClan.get({
    ConsistentRead: true,
    Key           : {
      pk: data.guild_id!,
      sk: clanTag,
    },
  });

  yield* ServerClan.put({
    Item: {
      ...clan.Item!,
      prep_opponent  : '',
      battle_opponent: '',
    },
  });

  return {
    embeds: [{description: 'cache bussin dun cache busted', color: nColor(COLOR.SUCCESS)}],
  };
});
