import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {getAliasTag} from '#src/clash/get-alias-tag.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {OPTION_CLAN} from '#src/constants/ix-constants.ts';
import {deleteDiscordClan, putDiscordClan, queryDiscordClan} from '#src/dynamo/schema/discord-clan.ts';
import {queryPlayersForUser} from '#src/dynamo/schema/discord-player.ts';
import type {CommandSpec, IxDS, snflk} from '#src/internal/discord-old/types.ts';
import {validateServer} from '#src/internal/discord-old/util/validation.ts';
import type {IxD} from '#src/internal/discord.ts';
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

/**
 * @desc [SLASH /clanfam]
 */
export const clanfam = (data: IxD, options: IxDS<typeof CLAN_FAM>) => E.gen(function* () {
  const [server, user] = yield* validateServer(data);

  if (!user.roles.includes(server.admin as snflk)) {
    return yield* new SlashUserError({issue: 'admin role required'});
  }

  const clanTag = yield* ClashOfClans.validateTag(getAliasTag(options.clan));

  const clan = yield* ClashOfClans.getClan(clanTag).pipe(replyError('clan does not exist.'));

  const playerLinks = pipe(
    yield* queryPlayersForUser({pk: user.user!.id}),
    mapL((pL) => pL.sk),
  );

  const leader = clan.members.find((m) => m.isLeader)?.tag;
  const coleaders = clan.members.filter((m) => m.isCoLeader).map((m) => m.tag);
  const elders = clan.members.filter((m) => m.isElder).map((m) => m.tag);

  const verification
          = playerLinks.includes(`${leader}`) ? 3
    : playerLinks.some((sk) => coleaders.includes(sk)) ? 2
      : playerLinks.some((sk) => elders.includes(sk)) ? 1
        : 0;

  const [discordClan, ...rest] = yield* queryDiscordClan({sk: clanTag});

  if (rest.length) {
    return yield* new SlashUserError({issue: 'real bad, this should never happen. call support lol'});
  }

  if (discordClan) {
    if (discordClan.verification > verification) {
      return yield* new SlashUserError({issue: 'your linked player tags cannot override this clan link'});
    }

    yield* deleteDiscordClan({pk: discordClan.pk, sk: discordClan.sk});

    const newClan = yield* putDiscordClan({
      ...discordClan,
      updated     : new Date(Date.now()),
      pk          : server.pk,
      verification: verification,
    });

    return {
      embeds: [{
        color      : nColor(COLOR.SUCCESS),
        description: `server ${data.guild_id} linked ${clan.name} (${clan.tag})\n${JSON.stringify(newClan, null, 2)}`,
      }],
    };
  }

  const newClan = yield* putDiscordClan({
    pk             : data.guild_id!,
    sk             : clan.tag,
    type           : 'DiscordClan',
    version        : '1.0.0',
    created        : new Date(Date.now()),
    updated        : new Date(Date.now()),
    gsi_server_id  : data.guild_id!,
    gsi_clan_tag   : clanTag,
    alias          : '',
    name           : clan.name,
    desc           : clan.description,
    uses           : [],
    thread_prep    : '',
    prep_opponent  : '',
    thread_battle  : '',
    battle_opponent: '',
    verification   : verification,
    countdown      : options.countdown,
  });

  return {
    embeds: [{
      color      : nColor(COLOR.SUCCESS),
      description: `server ${data.guild_id} linked ${clan.name} (${clan.tag})\n${JSON.stringify(newClan, null, 2)}`,
    }],
  };
});
