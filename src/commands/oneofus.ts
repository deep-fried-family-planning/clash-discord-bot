import {UserPlayerRegistry} from '#src/data/index.ts';
import {COLOR, nColor} from '#src/discord/old/colors.ts';
import type {CommandSpec, IxDS} from '#src/discord/old/types.ts';
import * as E from 'effect/Effect';
import type {Discord} from 'dfx';

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
      description: '[must be server admin] discord user account to link player tag',
    },
  },
} as const satisfies CommandSpec;

/**
 * @desc [SLASH /oneofus]
 */
export const oneofus = (data: Discord.APIInteraction, options: IxDS<typeof ONE_OF_US>) => E.gen(function* () {
  const registration = yield* UserPlayerRegistry.register({
    player_tag  : options.player_tag,
    caller_roles: data.member!.roles,
    caller_id   : data.member!.user.id,
    api_token   : options.api_token,
    target_id   : options.discord_user,
    payload     : {
      account_type: options.account_kind,
    },
  });

  return {
    embeds: [{
      color      : nColor(COLOR.SUCCESS),
      description: registration.description,
    }],
  };
});
