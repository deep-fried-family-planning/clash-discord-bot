import {Registry} from '#src/data/index.ts';
import {COLOR, nColor} from '#src/internal/old/colors.ts';
import {OPTION_CLAN} from '#src/internal/old/ix-constants.ts';
import type {CommandSpec, IxDS} from '#src/internal/old/types.ts';
import * as E from 'effect/Effect';
import type {Discord} from 'dfx';

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

export const clanfam = (data: Discord.APIInteraction, options: IxDS<typeof CLAN_FAM>) => E.gen(function* () {
  const registration = yield* Registry.registerClan({
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
