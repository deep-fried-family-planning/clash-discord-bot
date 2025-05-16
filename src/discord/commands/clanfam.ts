import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {getAliasTag} from '#src/clash/get-alias-tag.ts';
import { ServerClanRegistry } from '#src/data';
import {COLOR, nColor} from '#src/internal/discord-old/constants/colors.ts';
import {OPTION_CLAN} from '#src/internal/discord-old/constants/ix-constants.ts';
import type {IxD} from '#src/internal/discord-old/discord.ts';
import type {CommandSpec, IxDS, snflk} from '#src/internal/discord-old/types.ts';
import {validateServer} from '#src/internal/discord-old/validation.ts';
import {replyError, SlashUserError} from '#src/internal/errors.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {mapL} from '#src/internal/pure/pure-list.ts';

export const CLAN_FAM = {
  type       : 1,
  name       : 'clanfam',
  description: 'link clan to your discord server in deepfryer',
  options    : {
    ...OPTION_CLAN,
    countdown: {
      type       : 7,
      name       : 'countdown',
      description: 'oomgaboomga',
      required   : true,
    },
  },
} as const satisfies CommandSpec;

export const clanfam = (data: IxD, options: IxDS<typeof CLAN_FAM>) => E.gen(function* () {
  const registration = yield* ServerClanRegistry.register({
    guild_id    : data.guild_id!,
    caller_roles: data.member!.roles,
    caller_id   : data.member!.user.id,
    clan_tag    : options.clan,
    payload     : {
      countdown: options.countdown,
    },
  });

  return {
    embeds: [{
      color      : nColor(COLOR.SUCCESS),
      description: registration.description,
    }],
  };
});
