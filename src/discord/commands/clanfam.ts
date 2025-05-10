import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {getAliasTag} from '#src/clash/get-alias-tag.ts';
import {ServerClan, UserPlayer} from '#src/database/arch/codec.ts';
import {deleteItem, queryServerClans, readPartition, saveItem} from '#src/database/DeepFryerDB.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {OPTION_CLAN} from '#src/constants/ix-constants.ts';
import type {IxD} from '#src/internal/discord.ts';
import type {CommandSpec, IxDS, snflk} from '#src/discord/types.ts';
import {validateServer} from '#src/internal/validation.ts';
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
    yield* readPartition(UserPlayer, user.user!.id),
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

  const [discordClan, ...rest] = yield* queryServerClans(clanTag);

  if (rest.length) {
    return yield* new SlashUserError({issue: 'real bad, this should never happen. call support lol'});
  }

  if (discordClan) {
    if (discordClan.verification > verification) {
      return yield* new SlashUserError({issue: 'your linked player tags cannot override this clan link'});
    }

    yield* deleteItem(ServerClan, discordClan.pk, discordClan.sk);

    const newClan = yield* saveItem(ServerClan, {
      ...discordClan,
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

  const newClan = yield* saveItem(ServerClan, {
    _tag           : 'ServerClan',
    pk             : data.guild_id!,
    sk             : clan.tag,
    gsi_server_id  : data.guild_id!,
    gsi_clan_tag   : clanTag,
    name           : clan.name,
    description    : clan.description,
    thread_prep    : '',
    prep_opponent  : '',
    thread_battle  : '',
    battle_opponent: '',
    verification   : verification,
    countdown      : options.countdown,
    version        : 0,
    created        : undefined,
    updated        : undefined,
    select         : {
      value: clanTag,
      label: clan.name,
    },
  });

  return {
    embeds: [{
      color      : nColor(COLOR.SUCCESS),
      description: `server ${data.guild_id} linked ${clan.name} (${clan.tag})\n${JSON.stringify(newClan, null, 2)}`,
    }],
  };
});
